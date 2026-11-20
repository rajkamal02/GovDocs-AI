import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import { config } from '../config';
import { CATEGORIES } from '../types';
import { Box } from './enhance.util';
import { imageMeta } from './image.util';

export interface ReqItem { kind: 'photo' | 'signature' | 'document' | 'other'; label: string; format?: string; minKB?: number; maxKB?: number; width?: number; height?: number; dpi?: number; background?: string; notes?: string }
export interface ReqResult { exam: string | null; items: ReqItem[]; notes: string | null; source: 'ai' | 'rules' }

const toKB = (v: string, unit: string) => { const n = parseFloat(v); return /mb/i.test(unit) ? n * 1024 : n; };

/** Offline fallback: pulls sizes / pixel dimensions / formats out of pasted notification text. */
export function parseRequirements(text: string): ReqResult {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const kindOf = (s: string): { kind: ReqItem['kind']; label: string } | null => {
    if (/thumb|finger/i.test(s)) return { kind: 'document', label: 'Thumb impression' };
    if (/declaration/i.test(s)) return { kind: 'document', label: 'Hand-written declaration' };
    if (/signature|\bsign\b/i.test(s)) return { kind: 'signature', label: 'Signature' };
    if (/photo|picture|passport size/i.test(s)) return { kind: 'photo', label: 'Photograph' };
    if (/aadhaar|aadhar/i.test(s)) return { kind: 'document', label: 'Aadhaar' };
    if (/\bpan\b/i.test(s)) return { kind: 'document', label: 'PAN card' };
    if (/marksheet|certificate|resume|\bcv\b|document/i.test(s)) return { kind: 'document', label: 'Document' };
    return null;
  };
  const blocks: { k: { kind: ReqItem['kind']; label: string }; text: string }[] = [];
  for (const l of lines) {
    const k = kindOf(l);
    if (k) blocks.push({ k, text: l }); else if (blocks.length) blocks[blocks.length - 1].text += ' ' + l;
  }
  const items: ReqItem[] = blocks.map(({ k, text: t }) => {
    const it: ReqItem = { ...k };
    const range = /(\d+(?:\.\d+)?)\s*(kb|mb)?\s*(?:to|-|–|and)\s*(\d+(?:\.\d+)?)\s*(kb|mb)/i.exec(t);
    if (range) { it.minKB = toKB(range[1], range[2] || range[4]); it.maxKB = toKB(range[3], range[4]); }
    else {
      const mx = /(?:max(?:imum)?|up ?to|below|less than|not (?:more|exceed(?:ing)?)(?: than)?|under|within)\D{0,15}(\d+(?:\.\d+)?)\s*(kb|mb)/i.exec(t);
      const mn = /(?:min(?:imum)?|at least|not less than|above|more than)\D{0,15}(\d+(?:\.\d+)?)\s*(kb|mb)/i.exec(t);
      if (mx) it.maxKB = toKB(mx[1], mx[2]);
      if (mn) it.minKB = toKB(mn[1], mn[2]);
      if (!mx && !mn) { const one = /(\d+(?:\.\d+)?)\s*(kb|mb)/i.exec(t); if (one) it.maxKB = toKB(one[1], one[2]); }
    }
    const dim = /(\d{2,4})\s*(?:px|pixels?)?\s*[x×*]\s*(\d{2,4})\s*(?:px|pixels?)/i.exec(t) || /(\d{2,4})\s*[x×*]\s*(\d{2,4})\s*(?:px|pixel)/i.exec(t);
    if (dim) { it.width = +dim[1]; it.height = +dim[2]; }
    else if (/\d\s*(?:cm|mm)/i.test(t)) it.notes = 'Size is given in cm/mm - enter pixel width and height yourself.';
    if (/jpe?g|jpg/i.test(t)) it.format = 'jpg'; else if (/\bpng\b/i.test(t)) it.format = 'png'; else if (/\bpdf\b/i.test(t)) it.format = 'pdf';
    if (/white background/i.test(t)) it.background = 'white';
    const dpi = /(\d{2,3})\s*dpi/i.exec(t); if (dpi) it.dpi = +dpi[1];
    return it;
  });
  return { exam: null, items, notes: items.length ? 'Read with built-in rules. Add GEMINI_API_KEY for smarter extraction.' : 'No file requirements found in this text.', source: 'rules' };
}

@Injectable()
export class AiService {
  get enabled() { return !!config.gemini.key; }
  get imagesEnabled() { return this.enabled && config.aiImages; }

  private async gemini(parts: any[]): Promise<any> {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${config.gemini.model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': config.gemini.key },
      body: JSON.stringify({ contents: [{ parts }], generationConfig: { temperature: 0, responseMimeType: 'application/json' } }),
    });
    if (!res.ok) throw new Error(`Gemini ${res.status}`);
    const j: any = await res.json();
    const txt = j.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    return JSON.parse(txt.replace(/```json|```/g, '').trim());
  }
  private async imgPart(buf: Buffer) {
    const jpg = await sharp(buf, { failOn: 'none' }).rotate().resize(1280, 1280, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 80 }).toBuffer();
    return { inlineData: { mimeType: 'image/jpeg', data: jpg.toString('base64') } };
  }

  /** Requirement notices are public text/screenshots, so they may go to the AI whenever a key is set. */
  async detectRequirements(text: string, image?: Buffer): Promise<ReqResult> {
    const fallback = () => parseRequirements(text || '');
    if (!this.enabled) {
      if (image && !text) return { exam: null, items: [], notes: 'Reading screenshots needs AI. Set GEMINI_API_KEY, or paste the requirement text instead.', source: 'rules' };
      return fallback();
    }
    try {
      const parts: any[] = [];
      if (image) parts.push(await this.imgPart(image));
      parts.push({ text: `You extract file-upload requirements from Indian government exam / job application notices.
Return ONLY JSON: {"exam": string|null, "items":[{"kind":"photo|signature|document|other","label":string,"format":"jpg|png|pdf"|null,"minKB":number|null,"maxKB":number|null,"width":number|null,"height":number|null,"dpi":number|null,"background":string|null,"notes":string|null}], "notes": string|null}
Sizes in KB (convert MB). width/height in pixels only (if given in cm, leave null and mention it in notes). One item per file the candidate must upload. Use null when not stated.
Notice text:\n${text || '(see image)'}` });
      const r = await this.gemini(parts);
      const items: ReqItem[] = (r.items || []).map((i: any) => {
        const o: any = {};
        for (const k of ['kind', 'label', 'format', 'minKB', 'maxKB', 'width', 'height', 'dpi', 'background', 'notes']) if (i[k] !== null && i[k] !== undefined) o[k] = i[k];
        return o;
      });
      return { exam: r.exam || null, items, notes: r.notes || null, source: 'ai' };
    } catch {
      return { ...fallback(), notes: 'AI was unavailable, so built-in rules were used.' };
    }
  }

  async detectCategory(name: string, buf: Buffer | null, mime: string): Promise<{ category: string; confidence: 'high' | 'medium' | 'low'; source: string }> {
    const n = name.toLowerCase();
    const byName: [RegExp, string][] = [[/aadhaar|aadhar|uidai/, 'AADHAAR'], [/\bpan\b|pancard/, 'PAN_CARD'], [/sign/, 'SIGNATURE'], [/photo|passport|pic\b|selfie/, 'PASSPORT_PHOTO'],
      [/resume|\bcv\b|biodata/, 'RESUME'], [/mark ?sheet|marks|result|grade/, 'MARKSHEET'], [/certificate|cert\b|diploma|degree/, 'CERTIFICATE'], [/passport|voter|driving|licen[sc]e|ration|govt|id\b/, 'GOVT_ID']];
    for (const [re, cat] of byName) if (re.test(n)) return { category: cat, confidence: 'high', source: 'file name' };
    if (buf && this.imagesEnabled) {
      try {
        const r = await this.gemini([await this.imgPart(buf), { text: `Classify this Indian document image. Return JSON {"category": one of ${CATEGORIES.join('|')}}. Passport-size face photo=PASSPORT_PHOTO, handwritten signature on plain paper=SIGNATURE.` }]);
        if ((CATEGORIES as readonly string[]).includes(r.category)) return { category: r.category, confidence: 'high', source: 'AI' };
      } catch { /* fall through */ }
    }
    if (buf && mime.startsWith('image/')) {
      try {
        const m = await imageMeta(buf);
        const ar = m.width / m.height;
        if (ar > 1.7 && m.mean > 170) return { category: 'SIGNATURE', confidence: 'medium', source: 'image shape' };
        if (ar > 0.65 && ar < 1.0 && Math.max(m.width, m.height) <= 2400) return { category: 'PASSPORT_PHOTO', confidence: 'low', source: 'image shape' };
      } catch { /* ignore */ }
    }
    return { category: 'OTHER', confidence: 'low', source: 'none' };
  }

  async faceBox(buf: Buffer): Promise<Box | null> {
    if (!this.imagesEnabled) return null;
    try {
      const r = await this.gemini([await this.imgPart(buf), { text: 'Find the main human face (forehead to chin). Return JSON {"x":number,"y":number,"w":number,"h":number} as fractions 0..1 of image width/height (x,y = top-left). If no face return {"x":null}.' }]);
      if (typeof r.x === 'number' && r.w > 0.03 && r.h > 0.03) return { x: r.x, y: r.y, w: r.w, h: r.h };
    } catch { /* no box */ }
    return null;
  }
}

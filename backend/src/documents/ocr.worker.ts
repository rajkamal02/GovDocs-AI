// Runs in a separate process so an OCR failure (no internet for language data, corrupt image...) can never crash the API.
import { createWorker } from 'tesseract.js';

const send = (m: any) => { try { process.send?.(m); } catch { /* parent gone */ } };
process.on('uncaughtException', (e: any) => { send({ ok: false, error: String(e?.message || e) }); process.exit(1); });
process.on('unhandledRejection', (e: any) => { send({ ok: false, error: String(e?.message || e) }); process.exit(1); });

process.on('message', async (m: any) => {
  try {
    const w = await createWorker(m.langs, 1, { cachePath: m.cachePath, logger: () => undefined });
    const r = await w.recognize(m.file);
    await w.terminate();
    send({ ok: true, text: r.data.text || '' });
    process.exit(0);
  } catch (e: any) {
    send({ ok: false, error: String(e?.message || e) });
    process.exit(1);
  }
});

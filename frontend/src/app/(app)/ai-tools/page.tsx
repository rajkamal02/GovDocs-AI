import Link from 'next/link';
import { PageHeader } from '@/components/ui';

const TOOLS = [
  ['/ai-tools/requirement-detector', '🤖', 'Requirement Reader', 'Paste the notification text or upload a screenshot. We pick out file type, size limits and pixels.', ['Text or screenshot', 'Save as your own preset', 'Apply to any file'], 'bg-brand-50'],
  ['/ai-tools/photo-enhancer', '📸', 'Passport Photo Maker', 'Plain white background, centred crop, brightness fix, exact size for the portal.', ['White / custom background', 'Face-centred crop', 'Exact KB + pixels'], 'bg-violet-50'],
  ['/ai-tools/signature-cleaner', '✍️', 'Signature Cleaner', 'Remove the paper, darken the ink, crop tightly and compress to the portal limit.', ['Clean white background', 'Darker, sharper ink', 'Transparent PNG option'], 'bg-emerald-50'],
];
export default function Tools() {
  return (
    <>
      <PageHeader title="AI Tools" sub="Smart helpers for the fiddly parts of an application" />
      <div className="grid gap-4 md:grid-cols-3">
        {TOOLS.map(([h, i, t, d, f, bg]: any) => (
          <Link key={h} href={h} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-lg">
            <div className={`${bg} p-6`}><div className="mb-3 text-5xl">{i}</div><h2 className="font-display text-xl font-bold">{t}</h2><p className="mt-1 text-sm text-slate-600">{d}</p></div>
            <ul className="space-y-1.5 p-5 text-sm text-slate-600">{f.map((x: string) => <li key={x}>✓ {x}</li>)}<li className="pt-2 font-semibold text-brand-700 group-hover:underline">Open tool →</li></ul>
          </Link>
        ))}
      </div>
    </>
  );
}

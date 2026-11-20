import Link from 'next/link';

const FEATURES = [
  ['🗄️', 'Private document vault', 'Aadhaar, PAN, photo, signature, marksheets - encrypted with AES-256 and organised in folders.'],
  ['⚡', 'Exact size, every time', 'Set KB range, pixels, DPI and format. We find the right quality automatically. Originals never change.'],
  ['🎯', '25+ exam presets', 'SSC, UPSC, Railway, Banking, Police, State PSC, CUET, NEET, JEE - one tap.'],
  ['🤖', 'AI requirement reader', 'Paste the notification or a screenshot. Sizes and formats are picked out for you.'],
  ['📸', 'Photo & signature tools', 'White background, centred crop, brightness fix. Clean, dark, tightly cropped signatures.'],
  ['📦', 'One-click ready ZIP', 'SSC_CHSL_READY.zip with photo.jpg, signature.jpg, aadhaar.pdf - all within limits.'],
];
const EXAMS = ['SSC CGL', 'SSC CHSL', 'UPSC CSE', 'RRB NTPC', 'RRB Group D', 'SBI PO', 'IBPS PO', 'IBPS Clerk', 'UP Police', 'Bihar Police', 'State PSC', 'DSSSB', 'CUET UG', 'NEET UG', 'JEE Main'];

export default function Landing() {
  return (
    <div className="bg-white">
      <nav className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-5 backdrop-blur sm:px-10">
        <div className="flex items-center gap-2.5"><span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-violet-600 text-lg">🏛️</span><span className="font-display text-lg font-bold">GovDocs <span className="text-brand-600">AI</span></span></div>
        <div className="flex gap-2"><Link href="/sign-in" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:border-brand-200">Log in</Link><Link href="/sign-up" className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">Start free</Link></div>
      </nav>
      <header className="bg-gradient-to-b from-brand-50 to-white px-5 pb-16 pt-14 text-center sm:pt-20">
        <div className="mx-auto mb-5 inline-flex rounded-full border border-brand-200 bg-white px-4 py-1.5 text-xs font-semibold text-brand-700">Made for government job & exam applicants</div>
        <h1 className="mx-auto max-w-3xl font-display text-4xl font-extrabold leading-tight sm:text-6xl">Your documents.<br /><span className="bg-gradient-to-r from-brand-600 to-violet-600 bg-clip-text text-transparent">Government-ready. Always.</span></h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-slate-600 sm:text-lg">Upload once. Download any file in the exact size, format and dimensions the portal asks for. No more resizing, compressing and renaming at midnight before the last date.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3"><Link href="/sign-up" className="rounded-xl bg-brand-600 px-7 py-3.5 font-semibold text-white shadow-lg shadow-brand-600/20 hover:bg-brand-700">Get started free</Link><Link href="/dashboard" className="rounded-xl border border-slate-200 bg-white px-7 py-3.5 font-semibold hover:border-brand-200">Open the app</Link></div>
      </header>
      <section className="mx-auto max-w-6xl px-5 py-14">
        <h2 className="mb-8 text-center font-display text-2xl font-bold sm:text-3xl">Everything for your application, in one place</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{FEATURES.map(([i, t, d]) => <div key={t} className="rounded-2xl border border-slate-200 p-6 transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg"><div className="mb-3 text-3xl">{i}</div><h3 className="font-display text-lg font-bold">{t}</h3><p className="mt-1 text-sm text-slate-600">{d}</p></div>)}</div>
      </section>
      <section className="bg-slate-50 px-5 py-14"><div className="mx-auto max-w-4xl text-center"><h2 className="font-display text-2xl font-bold">Presets for the portals you use</h2><div className="mt-6 flex flex-wrap justify-center gap-2">{EXAMS.map((e) => <span key={e} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">{e}</span>)}</div><p className="mt-5 text-xs text-slate-500">Portal rules change with every notification. Presets are typical values - always check the official notice, or let the AI reader pull the exact numbers.</p></div></section>
      <section className="mx-auto max-w-4xl px-5 py-14"><div className="rounded-3xl bg-slate-900 p-8 text-white sm:p-12"><h2 className="font-display text-2xl font-bold">Private by design 🔒</h2><ul className="mt-4 space-y-2 text-sm text-slate-300"><li>• Every file is encrypted (AES-256-GCM) before it is stored, with a separate key per user.</li><li>• Your uploaded original is never modified. Processed files are temporary copies, deleted after download.</li><li>• Share links can expire, need a password, and have a download limit.</li><li>• Your files are not sent to any AI unless you switch that option on.</li></ul></div></section>
      <footer className="border-t border-slate-200 px-5 py-6 text-center text-xs text-slate-500">© GovDocs AI · Not affiliated with any government body.</footer>
    </div>
  );
}

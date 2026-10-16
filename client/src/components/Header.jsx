export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-slate-950/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <a href="#home" className="flex shrink-0 items-center gap-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400" aria-label="SnapLoad home">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-xl font-black shadow-lg shadow-rose-950/40">S</span>
          <span className="text-xl font-extrabold tracking-tight sm:text-2xl">Snap<span className="text-rose-400">Load</span></span>
        </a>
        <div className="hidden items-center gap-7 text-sm text-slate-300 md:flex">
          <a className="transition hover:text-white" href="#how-it-works">How it works</a>
          <a className="transition hover:text-white" href="#features">Features</a>
          <a className="transition hover:text-white" href="#faq">FAQ</a>
        </div>
        <a href="#downloader" className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-2.5 text-sm font-semibold transition hover:border-rose-400/40 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-rose-400 sm:px-4">
          Try it <span className="ml-2" aria-hidden="true">↓</span>
        </a>
      </nav>
    </header>
  );
}
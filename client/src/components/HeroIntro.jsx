export default function HeroIntro() {
  return (
    <div className="mx-auto w-full max-w-2xl text-center lg:mx-0 lg:text-left">
      <div className="inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-500/[0.08] px-3.5 py-2 text-xs font-semibold text-rose-200 sm:text-sm">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-400" />
        </span>
        One workspace · Three platforms
      </div>
      <h1 className="mt-6 text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl md:text-6xl xl:text-7xl">
        Your links.
        <span className="mt-2 block bg-gradient-to-r from-rose-400 via-orange-300 to-fuchsia-400 bg-clip-text text-transparent">
          One simple workflow.
        </span>
      </h1>
      <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8 lg:mx-0">
        Check supported Instagram, YouTube and Pinterest links in one clean, mobile-friendly workspace.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-400 sm:text-sm lg:justify-start">
        <span className="inline-flex items-center gap-2"><span className="text-emerald-400">✓</span> No account required</span>
        <span className="inline-flex items-center gap-2"><span className="text-emerald-400">✓</span> Mobile-friendly</span>
        <span className="inline-flex items-center gap-2"><span className="text-emerald-400">✓</span> Clear status</span>
      </div>
    </div>
  );
}
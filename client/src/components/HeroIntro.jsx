const HIGHLIGHTS = ["No account required", "Mobile-friendly", "Clear status"];

export default function HeroIntro() {
  return (
    <div className="relative mx-auto w-full max-w-2xl text-center lg:mx-0 lg:text-left">
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-10 -top-16 h-56 w-56 rounded-full bg-rose-500/15 blur-3xl"
      />

      <div className="relative inline-flex items-center gap-2.5 rounded-full border border-rose-400/20 bg-gradient-to-r from-rose-500/10 to-fuchsia-500/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-200 shadow-lg shadow-rose-950/20 backdrop-blur-md sm:text-xs">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-400" />
        </span>
        One workspace · Three platforms
      </div>

      <h1 className="relative mt-7 text-4xl font-extrabold leading-[1.06] tracking-tight text-white sm:text-5xl md:text-6xl xl:text-7xl">
        Your links.
        <span className="mt-2 block bg-gradient-to-r from-rose-400 via-orange-300 to-fuchsia-400 bg-clip-text pb-1 text-transparent">
          One simple workflow.
        </span>
      </h1>

      <p className="relative mx-auto mt-6 max-w-xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8 lg:mx-0">
        Check supported Instagram, YouTube and Pinterest links in one clean,
        mobile-friendly workspace.
      </p>

      <ul className="relative mt-9 flex flex-wrap items-center justify-center gap-2.5 lg:justify-start">
        {HIGHLIGHTS.map((item) => (
          <li
            key={item}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-slate-300 backdrop-blur-sm sm:text-sm"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              className="h-3.5 w-3.5 text-emerald-400 sm:h-4 sm:w-4"
              aria-hidden="true"
            >
              <path
                d="m5 12 5 5L20 7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/[0.08]">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-center sm:px-6 md:flex-row md:items-center md:justify-between md:text-left lg:px-8">
        <a href="#home" className="text-lg font-extrabold tracking-tight">
          Snap<span className="text-rose-400">Load</span>
        </a>
        <p className="text-xs leading-5 text-slate-500">
          SnapLoad is not affiliated with Instagram, YouTube or Pinterest. All
          trademarks belong to their respective owners.
        </p>
        <a
          href="#home"
          className="text-xs font-semibold text-slate-400 transition hover:text-white"
        >
          Back to top ↑
        </a>
      </div>
    </footer>
  );
}

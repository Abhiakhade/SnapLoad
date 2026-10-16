export default function BackgroundEffects() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-0 overflow-hidden"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(190,24,93,0.16),transparent_48%)]" />
      <div className="snap-float absolute -left-32 top-44 h-72 w-72 rounded-full bg-rose-600/10 blur-3xl" />
      <div className="absolute -right-32 top-72 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />
      <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:48px_48px]" />
    </div>
  );
}

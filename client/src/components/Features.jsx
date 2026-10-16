import { features } from "../data/snaploadData";

export default function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-rose-300">Made for everyday use</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Useful by design</h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-slate-400">
          A focused interface that keeps the experience simple across screen sizes.
        </p>
      </div>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <article key={feature.title} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition hover:border-white/15 hover:bg-white/[0.045] sm:p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500/15 to-orange-500/10 text-xl">
              {feature.icon}
            </span>
            <h3 className="mt-4 font-bold">{feature.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">{feature.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

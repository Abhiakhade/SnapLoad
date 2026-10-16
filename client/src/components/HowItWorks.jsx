import { steps } from "../data/snaploadData";

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative border-y border-white/[0.07] bg-white/[0.018]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-rose-300">Three simple steps</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">A clearer way to check links</h2>
          <p className="mt-4 text-sm leading-6 text-slate-400 sm:text-base">
            No confusing controls. Just paste, check, and review the available status.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step) => (
            <article key={step.number} className="group rounded-2xl border border-white/[0.08] bg-slate-900/60 p-5 transition duration-200 hover:-translate-y-1 hover:border-rose-400/25 hover:bg-slate-900 sm:p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-black tracking-widest text-rose-300">{step.number}</span>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-xl text-slate-200 transition group-hover:border-rose-400/20 group-hover:bg-rose-500/10">
                  {step.icon}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-bold">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

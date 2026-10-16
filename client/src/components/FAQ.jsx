import { faqs } from "../data/snaploadData";

export default function FAQ({ openFaq, onToggle }) {
  return (
    <section id="faq" className="border-t border-white/[0.07] bg-white/[0.018]">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-rose-300">
            Need to know
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Frequently asked questions
          </h2>
        </div>
        <div className="mt-8 space-y-3">
          {faqs.map((faq, index) => {
            const expanded = openFaq === index;

            return (
              <div
                key={faq.question}
                className="overflow-hidden rounded-2xl border border-white/[0.08] bg-slate-900/60"
              >
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => onToggle(expanded ? -1 : index)}
                  className="flex w-full items-center justify-between gap-4 p-4 text-left font-semibold transition hover:bg-white/[0.035] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-rose-400 sm:p-5"
                >
                  <span className="text-sm sm:text-base">{faq.question}</span>
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 text-slate-300 transition ${expanded ? "rotate-45 bg-white/[0.06]" : ""}`}
                    aria-hidden="true"
                  >
                    +
                  </span>
                </button>
                {expanded && (
                  <div className="snap-in px-4 pb-5 text-sm leading-6 text-slate-400 sm:px-5">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

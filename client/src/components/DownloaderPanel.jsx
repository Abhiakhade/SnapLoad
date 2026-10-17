import StatusMessage from "./StatusMessage";
import LinkForm from "./LinkForm";

const HIGHLIGHTS = ["Simple to use", "Responsive layout", "Download progress"];

export default function DownloaderPanel(props) {
  return (
    <section
      id="downloader"
      className="relative w-full min-w-0 scroll-mt-28 overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-b from-slate-900/90 to-[#0b0e1a]/95 p-5 shadow-2xl shadow-black/40 ring-1 ring-inset ring-white/5 backdrop-blur-xl sm:p-7 md:p-9"
    >
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-28 h-64 w-64 rounded-full bg-rose-500/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-24 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl"
      />

      {/* Header */}
      <div className="relative mb-7 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-300">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            Link checker
          </span>

          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Start with a link
          </h2>
          <p className="mt-1.5 max-w-md text-sm leading-6 text-slate-400">
            Choose a platform and paste a URL.
          </p>
        </div>

        <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] shadow-lg shadow-black/20 sm:flex">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            className="h-5 w-5 text-rose-300"
            aria-hidden="true"
          >
            <path
              d="M10 13a5 5 0 0 0 7.07 0l3-3A5 5 0 0 0 13 2.93l-1.72 1.72M14 11a5 5 0 0 0-7.07 0l-3 3A5 5 0 0 0 11 21.07l1.72-1.72"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <div className="relative">
        <LinkForm
          platform={props.platform}
          onPlatformSelect={props.onPlatformSelect}
          url={props.url}
          onUrlChange={props.onUrlChange}
          onPaste={props.onPaste}
          onSubmit={props.onSubmit}
          loading={props.loading}
        />

        <div className="mt-4 empty:mt-0">
          <StatusMessage
            status={props.status}
            loading={props.loading}
            onDismiss={props.onDismissStatus}
          />
        </div>
      </div>

      {/* Footer highlights */}
      <ul className="relative mt-7 flex flex-wrap items-center justify-center gap-2 border-t border-white/[0.07] pt-5 sm:justify-start">
        {HIGHLIGHTS.map((item) => (
          <li
            key={item}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium text-slate-300"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              className="h-3.5 w-3.5 text-emerald-400"
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
    </section>
  );
}

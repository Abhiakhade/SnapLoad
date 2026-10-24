import StatusMessage from "./StatusMessage";
import LinkForm from "./LinkForm";

const HIGHLIGHTS = ["Simple to use", "Responsive layout", "Download progress"];

export default function DownloaderPanel(props) {
  return (
    <section
      id="downloader"
      className="relative w-full min-w-0 scroll-mt-24 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/90 to-[#0b0e1a]/95 p-3 shadow-2xl shadow-black/40 ring-1 ring-inset ring-white/5 backdrop-blur-xl sm:p-4 md:p-5"
    >
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-28 h-48 w-48 rounded-full bg-rose-500/15 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-20 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl"
      />

      {/* Compact header */}
      <div className="relative mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/20 bg-rose-400/10 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-rose-300">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            Link checker
          </span>

          <h2 className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">
            Start with a link
          </h2>

          <p className="mt-1 max-w-md text-xs leading-5 text-slate-400">
            Choose a platform and paste a URL.
          </p>
        </div>

        <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] shadow-lg shadow-black/20 sm:flex">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            className="h-4 w-4 text-rose-300"
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

      {/* Main link form */}
      <div className="relative min-w-0">
        <LinkForm
          platform={props.platform}
          onPlatformSelect={props.onPlatformSelect}
          url={props.url}
          onUrlChange={props.onUrlChange}
          onPaste={props.onPaste}
          onSubmit={props.onSubmit}
          loading={props.loading}
        />

        <div className="mt-3">
          <StatusMessage
            status={props.status}
            loading={props.loading}
            onDismiss={props.onDismissStatus}
          />
        </div>
      </div>

      {/* Compact footer highlights */}
      <ul className="relative mt-4 flex flex-wrap items-center justify-center gap-2 border-t border-white/[0.07] pt-3 sm:justify-start">
        {HIGHLIGHTS.map((item) => (
          <li
            key={item}
            className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-medium text-slate-300"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              className="h-3 w-3 text-emerald-400"
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

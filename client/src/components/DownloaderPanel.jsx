import StatusMessage from "./StatusMessage";
import LinkForm from "./LinkForm";

export default function DownloaderPanel(props) {
  return (
    <section
      id="downloader"
      className="w-full min-w-0 scroll-mt-28 rounded-3xl border border-white/10 bg-[#101321]/95 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6 md:p-7"
    >
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-rose-400">
            Link checker
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
            Start with a link
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Choose a platform and paste a URL.
          </p>
        </div>

        <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] sm:flex">
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

      <LinkForm
        platform={props.platform}
        onPlatformSelect={props.onPlatformSelect}
        url={props.url}
        onUrlChange={props.onUrlChange}
        onPaste={props.onPaste}
        onSubmit={props.onSubmit}
        loading={props.loading}
      />

      <div className="mt-4">
        <StatusMessage
          status={props.status}
          loading={props.loading}
          onDismiss={props.onDismissStatus}
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-white/[0.07] pt-4 text-[11px] text-slate-500 sm:justify-start">
        <span className="flex items-center gap-1.5">
          <span className="text-emerald-400">✓</span> Simple to use
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-emerald-400">✓</span> Responsive layout
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-emerald-400">✓</span> Download progress
        </span>
      </div>
    </section>
  );
}

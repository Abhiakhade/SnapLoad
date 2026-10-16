import PlatformSelector from "./PlatformSelector";
export default function LinkForm({
  platform,
  onPlatformSelect,
  url,
  onUrlChange,
  onPaste,
  onSubmit,
  loading,
}) {
  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-300">
            Link checker
          </p>
          <h2 className="mt-2 text-xl font-bold sm:text-2xl">
            Start with a link
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Choose a platform or paste a URL.
          </p>
        </div>
        <div className="hidden h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-xl sm:flex">
          ↘
        </div>
      </div>
      <PlatformSelector platform={platform} onSelect={onPlatformSelect} />
      <form className="mt-5" onSubmit={onSubmit}>
        <label
          htmlFor="snapload-url"
          className="mb-2 block text-sm font-semibold text-slate-200"
        >
          Paste your {platform} link
        </label>
        <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-slate-950/80 p-2 transition focus-within:border-rose-400/60 focus-within:ring-4 focus-within:ring-rose-500/10 sm:flex-row">
          <input
            id="snapload-url"
            type="url"
            inputMode="url"
            autoComplete="url"
            spellCheck="false"
            value={url}
            onChange={onUrlChange}
            placeholder="https://…"
            aria-describedby="url-help"
            className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-slate-600 sm:px-2"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onPaste}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.07] focus:outline-none focus:ring-2 focus:ring-rose-400 sm:flex-none"
            >
              ▣ <span>Paste</span>
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex flex-[1.4] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-rose-950/30 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-70 sm:flex-none sm:px-5"
            >
              {loading ? (
                <>
                  <span className="snap-spin h-4 w-4 rounded-full border-2 border-white/40 border-t-white" />
                  Checking
                </>
              ) : (
                <>
                  Check link <span>→</span>
                </>
              )}
            </button>
          </div>
        </div>
        <p id="url-help" className="mt-2 text-xs leading-5 text-slate-500">
          Use a complete URL from a supported platform.
        </p>
      </form>
    </>
  );
}

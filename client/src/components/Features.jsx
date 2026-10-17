import { features } from "../data/snaploadData";

// Search phrases people commonly use for this kind of tool.
// Only list things the app really does, and keep them visible (no hidden text).
const POPULAR_SEARCHES = [
  "YouTube video downloader",
  "YouTube to MP4",
  "Download YouTube video in HD",
  "4K YouTube video downloader",
  "Instagram reel downloader",
  "Instagram video downloader",
  "Instagram photo downloader",
  "Pinterest video downloader",
  "Pinterest image downloader",
  "Download video online free",
  "Online video downloader",
  "Video downloader for mobile",
  "Social media video downloader",
  "Save video in 1080p",
  "Download video without app",
];

export default function Features() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-10 h-64 w-[36rem] max-w-full -translate-x-1/2 rounded-full bg-rose-500/10 blur-3xl"
      />

      {/* Heading */}
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-300">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            Made for everyday use
          </span>
          <h2
            id="features-heading"
            className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl"
          >
            A free online video downloader,{" "}
            <span className="bg-gradient-to-r from-rose-400 via-orange-300 to-fuchsia-400 bg-clip-text text-transparent">
              useful by design
            </span>
          </h2>
        </div>

        <p className="max-w-md text-sm leading-7 text-slate-400 sm:text-base">
          Paste a link and download supported YouTube videos in HD or 4K,
          Instagram reels, videos and photos, and Pinterest videos and images.
          No app to install, and it works on phone, tablet and desktop.
        </p>
      </div>

      {/* Feature cards */}
      <div className="relative mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.015] p-5 transition duration-300 hover:-translate-y-1 hover:border-rose-400/30 hover:shadow-2xl hover:shadow-rose-950/30 sm:p-6"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-rose-500/0 blur-2xl transition duration-300 group-hover:bg-rose-500/20"
            />
            <span className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-rose-500/20 to-orange-500/10 text-xl shadow-lg shadow-black/20">
              {feature.icon}
            </span>
            <h3 className="relative mt-5 text-base font-semibold tracking-tight text-white">
              {feature.title}
            </h3>
            <p className="relative mt-2 text-sm leading-6 text-slate-400">
              {feature.description}
            </p>
          </article>
        ))}
      </div>

      {/* Popular searches */}
      <div className="relative mt-14 rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-8">
        <h3 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
          Download videos and images from YouTube, Instagram and Pinterest
        </h3>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-400">
          Snapload is an online video downloader for public links. Choose a
          quality from 144p up to 4K for YouTube, or save the available media
          file from Instagram and Pinterest, straight from your browser.
        </p>

        <ul aria-label="Popular searches" className="mt-5 flex flex-wrap gap-2">
          {POPULAR_SEARCHES.map((keyword) => (
            <li
              key={keyword}
              className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-slate-300 transition hover:border-rose-400/30 hover:text-rose-200 sm:text-[13px]"
            >
              {keyword}
            </li>
          ))}
        </ul>

        <p className="mt-5 text-[11px] leading-5 text-slate-500">
          Only download media you own or have permission to use.
        </p>
      </div>
    </section>
  );
}

import { useEffect, useState } from "react";

const STAGES = [
  { title: "Lights", subtitle: "Setting up the scene" },
  { title: "Camera", subtitle: "Getting everything in focus" },
  { title: "Action!", subtitle: "Your next download starts here" },
  { title: "Welcome to SnapLoad", subtitle: "Almost ready..." },
];

function StageIcon({ stage }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: "h-10 w-10 sm:h-12 sm:w-12",
    "aria-hidden": "true",
  };

  if (stage === 0) {
    // Light bulb
    return (
      <svg {...common}>
        <path d="M9 18h6M10 21h4" />
        <path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V16h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3Z" />
      </svg>
    );
  }

  if (stage === 1) {
    // Video camera
    return (
      <svg {...common}>
        <rect x="2.5" y="6" width="13" height="12" rx="3" />
        <path d="m15.5 10.5 6-3.5v10l-6-3.5" />
      </svg>
    );
  }

  // Clapperboard
  return (
    <svg {...common}>
      <rect x="3" y="9" width="18" height="11" rx="2" />
      <path d="m3 9 2.2-4.6 14-1.4L21 9M7.5 4.2l2.6 4.6M13 3.5l2.6 4.7" />
    </svg>
  );
}

export default function PageLoader() {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const stageTimers = [
      window.setTimeout(() => setStage(1), 500),
      window.setTimeout(() => setStage(2), 1000),
      window.setTimeout(() => setStage(3), 1500),
      window.setTimeout(() => setExiting(true), 2200),
      window.setTimeout(() => setVisible(false), 2700),
    ];

    return () => stageTimers.forEach(window.clearTimeout);
  }, []);

  // Prevent the page behind the loader from scrolling.
  useEffect(() => {
    if (!visible) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [visible]);

  if (!visible) return null;

  const current = STAGES[stage];
  const iconStage = Math.min(stage, 2);
  const progress = Math.min(100, (stage + 1) * 25);

  return (
    <div
      className={`fixed inset-0 z-[99999] flex min-h-screen items-center justify-center overflow-hidden bg-[#060711] px-5 transition-opacity duration-500 ${
        exiting ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      role="status"
      aria-live="polite"
      aria-label="Loading SnapLoad"
    >
      <style>{`
        @keyframes loader-orbit {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes loader-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes loader-enter {
          0% { opacity: 0; transform: translateY(16px) scale(.9); }
          65% { opacity: 1; transform: translateY(-2px) scale(1.03); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes loader-glow {
          0%, 100% { opacity: .3; transform: scale(.92); }
          50% { opacity: .75; transform: scale(1.12); }
        }
        @keyframes loader-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes loader-shine {
          0% { transform: translateX(-130%); }
          100% { transform: translateX(330%); }
        }

        .loader-orbit { animation: loader-orbit 18s linear infinite; }
        .loader-spin { animation: loader-spin 8s linear infinite; }
        .loader-glow { animation: loader-glow 2.2s ease-in-out infinite; }
        .loader-float { animation: loader-float 2.4s ease-in-out infinite; }
        .loader-enter { animation: loader-enter .55s cubic-bezier(.2,.8,.2,1) both; }
        .loader-shine { animation: loader-shine 1.6s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .loader-orbit, .loader-spin, .loader-glow, .loader-float, .loader-enter, .loader-shine {
            animation: none !important;
          }
        }
      `}</style>

      {/* Background */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-600/10 blur-[100px] sm:h-[600px] sm:w-[600px]" />
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-purple-600/10 blur-[100px]" />
        <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-orange-500/10 blur-[100px]" />

        <div className="loader-orbit absolute left-1/2 top-1/2 h-[320px] w-[320px] rounded-full border border-white/[0.05] sm:h-[480px] sm:w-[480px]">
          <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-400 shadow-[0_0_20px_5px_rgba(251,113,133,0.35)]" />
        </div>

        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.5)_1px,transparent_1px)] [background-size:44px_44px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#060711_100%)]" />
      </div>

      <div className="relative w-full max-w-md text-center">
        {/* Brand */}
        <div className="loader-enter flex items-center justify-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 via-rose-500 to-orange-500 text-lg font-black text-white shadow-lg shadow-rose-950/50 ring-1 ring-inset ring-white/20">
            S
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white">
            Snap<span className="text-rose-400">Load</span>
          </span>
        </div>

        {/* Icon medallion */}
        <div className="relative mx-auto mt-10 flex h-36 w-36 items-center justify-center sm:h-44 sm:w-44">
          <div className="loader-glow absolute inset-2 rounded-full bg-rose-500/25 blur-2xl" />

          <div className="loader-spin absolute inset-0 rounded-full border border-dashed border-white/15" />
          <div className="absolute inset-3 rounded-full border border-rose-400/20" />

          <div
            key={iconStage}
            className="loader-float relative flex h-24 w-24 items-center justify-center rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.12] to-white/[0.02] text-rose-300 shadow-2xl shadow-black/50 ring-1 ring-inset ring-white/10 backdrop-blur-xl sm:h-28 sm:w-28"
          >
            <span className="loader-enter flex">
              <StageIcon stage={iconStage} />
            </span>
          </div>

          <span className="absolute right-3 top-6 h-2.5 w-2.5 rounded-full bg-orange-300 shadow-[0_0_16px_rgba(253,186,116,0.8)]" />
          <span className="absolute bottom-6 left-3 h-2 w-2 rounded-full bg-rose-400 shadow-[0_0_14px_rgba(251,113,133,0.8)]" />
        </div>

        {/* Title */}
        <div className="mt-8 min-h-[112px]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-500">
            Your creative workspace
          </p>

          <h1
            key={stage}
            className="loader-enter mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl"
          >
            {stage < 2 ? (
              <>
                {current.title}
                <span className="text-rose-400">.</span>
              </>
            ) : (
              <span className="bg-gradient-to-r from-rose-400 via-orange-300 to-amber-200 bg-clip-text pb-1 text-transparent">
                {current.title}
              </span>
            )}
          </h1>

          <p className="mt-2.5 text-sm text-slate-400">{current.subtitle}</p>
        </div>

        {/* Progress */}
        <div className="mx-auto mt-4 h-1.5 w-52 overflow-hidden rounded-full bg-white/10 ring-1 ring-inset ring-white/5 sm:w-64">
          <div
            className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-rose-500 via-orange-400 to-amber-200 transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%` }}
          >
            <span className="loader-shine absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
          </div>
        </div>

        <div className="mt-5 inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          Initializing experience
        </div>
      </div>
    </div>
  );
}

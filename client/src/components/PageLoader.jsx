import { useEffect, useState } from "react";

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

  if (!visible) return null;

  const scenes = [
    { emoji: "💡", title: "LIGHTS", subtitle: "Setting the scene" },
    { emoji: "🎥", title: "CAMERA", subtitle: "Rolling your way" },
    { emoji: "🎬", title: "ACTION!", subtitle: "Welcome to SnapLoad" },
  ];

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
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes loader-enter {
          0% { opacity: 0; transform: translateY(18px) scale(.88); }
          65% { opacity: 1; transform: translateY(-3px) scale(1.04); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes loader-glow {
          0%, 100% { opacity: .25; transform: scale(.92); }
          50% { opacity: .7; transform: scale(1.12); }
        }

        @keyframes loader-scan {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(360%); }
        }

        @keyframes loader-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-7px); }
        }

        .loader-orbit { animation: loader-orbit 18s linear infinite; }
        .loader-glow { animation: loader-glow 2s ease-in-out infinite; }
        .loader-float { animation: loader-float 2s ease-in-out infinite; }
        .loader-enter { animation: loader-enter .55s cubic-bezier(.2,.8,.2,1) both; }
        .loader-scan { animation: loader-scan 1.8s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .loader-orbit, .loader-glow, .loader-float, .loader-enter, .loader-scan {
            animation: none !important;
          }
        }
      `}</style>

      {/* Cinematic background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-600/10 blur-[100px] sm:h-[600px] sm:w-[600px]" />
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-purple-600/10 blur-[100px]" />
        <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-orange-500/10 blur-[100px]" />

        <div className="loader-orbit absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.045] sm:h-[480px] sm:w-[480px]">
          <span className="absolute left-1/2 top-0 h-2 w-2 rounded-full bg-rose-400 shadow-[0_0_20px_5px_rgba(251,113,133,0.35)]" />
        </div>

        <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.5)_1px,transparent_1px)] [background-size:44px_44px]" />
      </div>

      <div className="relative w-full max-w-md text-center">
        {/* Brand */}
        <div className="loader-enter flex items-center justify-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-lg font-black text-white shadow-lg shadow-rose-500/25">
            S
          </div>
          <span className="text-lg font-extrabold tracking-tight text-white">
            Snap<span className="text-rose-400">Load</span>
          </span>
        </div>

        {/* Cinematic icon */}
        <div className="relative mx-auto mt-9 flex h-32 w-32 items-center justify-center sm:h-36 sm:w-36">
          <div className="loader-glow absolute inset-0 rounded-full bg-rose-500/20 blur-2xl" />

          <div className="absolute inset-2 rounded-full border border-rose-400/20" />
          <div className="absolute inset-0 rounded-full border border-dashed border-white/15" />

          <div className="loader-float relative flex h-24 w-24 items-center justify-center rounded-[28px] border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.02] text-5xl shadow-2xl backdrop-blur-xl sm:h-28 sm:w-28 sm:text-6xl">
            {stage < 1 ? "💡" : stage < 2 ? "🎥" : "🎬"}
          </div>

          <span className="absolute right-1 top-5 h-2.5 w-2.5 rounded-full bg-orange-300 shadow-[0_0_16px_rgba(253,186,116,0.8)]" />
          <span className="absolute bottom-4 left-1 h-2 w-2 rounded-full bg-rose-400 shadow-[0_0_14px_rgba(251,113,133,0.8)]" />
        </div>

        {/* Main title */}
        <div className="mt-7 min-h-[104px]">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-slate-500">
            Your creative workspace
          </p>

          <h1
            key={stage}
            className="loader-enter mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl"
          >
            {stage === 0 && (
              <>
                Lights<span className="text-rose-400">.</span>
              </>
            )}
            {stage === 1 && (
              <>
                Camera<span className="text-rose-400">.</span>
              </>
            )}
            {stage === 2 && (
              <>
                <span className="bg-gradient-to-r from-rose-400 via-orange-300 to-amber-200 bg-clip-text text-transparent">
                  Action!
                </span>
              </>
            )}
            {stage === 3 && (
              <span className="bg-gradient-to-r from-rose-400 to-orange-300 bg-clip-text text-transparent">
                Welcome to SnapLoad
              </span>
            )}
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            {stage === 0 && "Setting up the scene"}
            {stage === 1 && "Getting everything in focus"}
            {stage === 2 && "Your next download starts here"}
            {stage === 3 && "Almost ready..."}
          </p>
        </div>

        {/* Animated loading line */}
        <div className="mx-auto mt-5 h-1 w-48 overflow-hidden rounded-full bg-white/10 sm:w-56">
          <div
            className="h-full rounded-full bg-gradient-to-r from-rose-500 via-orange-400 to-amber-200 transition-[width] duration-500 ease-out"
            style={{ width: `${Math.min(100, (stage + 1) * 25)}%` }}
          />
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-medium tracking-[0.16em] text-slate-500">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          INITIALIZING EXPERIENCE
        </div>
      </div>
    </div>
  );
}

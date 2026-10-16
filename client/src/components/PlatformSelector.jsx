import { platforms } from "../data/snaploadData";

export default function PlatformSelector({ platform, onSelect }) {
  return (
    <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3" role="group" aria-label="Select platform">
      {platforms.map((item) => {
        const active = platform === item.name;

        return (
          <button
            key={item.name}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(item.name)}
            className={`min-w-0 rounded-2xl border p-3 text-center transition duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-rose-400 sm:p-4 ${
              active
                ? item.active
                : "border-white/10 bg-white/[0.025] hover:border-white/20 hover:bg-white/[0.05]"
            }`}
          >
            <span className={`mx-auto flex h-10 w-10 items-center justify-center rounded-xl text-xl font-black text-white shadow-lg ${item.icon}`}>
              {item.symbol}
            </span>
            <span className="mt-2 block truncate text-xs font-bold sm:text-sm">{item.name}</span>
            <span className="mt-1 hidden text-[11px] text-slate-500 sm:block">{item.description}</span>
          </button>
        );
      })}
    </div>
  );
}

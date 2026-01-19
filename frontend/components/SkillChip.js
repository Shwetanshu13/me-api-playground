import { classNames } from "./utils";

export function SkillChip({ active, children, onClick, title }) {
    return (
        <button
            type="button"
            title={title}
            onClick={onClick}
            className={classNames(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-200",
                active
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
            )}
        >
            {children}
        </button>
    );
}

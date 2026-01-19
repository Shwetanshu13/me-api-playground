export function WorkCard({ work }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{work.role}</p>
                    <p className="mt-0.5 text-sm text-slate-600">{work.company}</p>
                </div>
                {work.duration && (
                    <span className="shrink-0 text-xs font-medium text-slate-500">
                        {work.duration}
                    </span>
                )}
            </div>
            {work.description && (
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {work.description}
                </p>
            )}
        </div>
    );
}

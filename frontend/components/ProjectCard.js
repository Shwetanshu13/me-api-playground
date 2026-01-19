"use client";

import { useMemo } from "react";
import { formatLinks } from "./utils";

export function ProjectCard({ project }) {
    const links = useMemo(() => formatLinks(project.links), [project.links]);

    return (
        <article className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition-shadow duration-200 hover:shadow-md">
            <h3 className="text-base font-semibold text-slate-900 leading-snug">
                {project.title}
            </h3>

            {project.description ? (
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">
                    {project.description}
                </p>
            ) : (
                <p className="mt-2 text-sm text-slate-400 italic">No description</p>
            )}

            {!!(project.skills || []).length && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                    {project.skills.slice(0, 4).map((skill) => (
                        <span
                            key={`${project.id}-${skill}`}
                            className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
                        >
                            {skill}
                        </span>
                    ))}
                    {project.skills.length > 4 && (
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                            +{project.skills.length - 4}
                        </span>
                    )}
                </div>
            )}

            {!!links.length && (
                <div className="mt-auto pt-4 flex flex-wrap gap-2">
                    {links.slice(0, 2).map((href, idx) => (
                        <a
                            key={href}
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
                        >
                            <span>View {idx === 0 ? "Project" : "Demo"}</span>
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                    ))}
                </div>
            )}
        </article>
    );
}

"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

function classNames(...values) {
    return values.filter(Boolean).join(" ");
}

function formatLinks(links) {
    if (!links) return [];
    if (Array.isArray(links)) return links.filter(Boolean);
    if (typeof links === "string") {
        return links
            .split(/\s*,\s*|\s*\n\s*/g)
            .map((s) => s.trim())
            .filter(Boolean);
    }
    return [];
}

function SkillChip({ active, children, onClick, title }) {
    return (
        <button
            type="button"
            title={title}
            onClick={onClick}
            className={classNames(
                "group inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium transition",
                active
                    ? "border-fuchsia-300 bg-fuchsia-50 text-fuchsia-800 shadow-sm"
                    : "border-white/70 bg-white/70 text-slate-700 hover:bg-white"
            )}
        >
            <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-500" />
            {children}
        </button>
    );
}

function ProjectCard({ project }) {
    const links = useMemo(() => formatLinks(project.links), [project.links]);

    return (
        <article className="group rounded-2xl border border-white/70 bg-white/70 p-5 shadow-sm backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-4">
                <h3 className="text-lg font-semibold text-slate-900">{project.title}</h3>
                <span className="rounded-full bg-slate-900/5 px-2 py-1 text-xs font-medium text-slate-700">
                    #{project.id}
                </span>
            </div>

            {project.description ? (
                <p className="mt-2 line-clamp-4 text-sm leading-6 text-slate-600">{project.description}</p>
            ) : (
                <p className="mt-2 text-sm text-slate-500">No description provided.</p>
            )}

            {!!(project.skills || []).length && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {project.skills.map((skill) => (
                        <span
                            key={`${project.id}-${skill}`}
                            className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700"
                        >
                            {skill}
                        </span>
                    ))}
                </div>
            )}

            {!!links.length && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {links.slice(0, 3).map((href) => (
                        <a
                            key={href}
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800"
                        >
                            Link
                            <span className="text-white/70">↗</span>
                        </a>
                    ))}
                </div>
            )}
        </article>
    );
}

export default function PortfolioExplorer({
    profileBundle,
    topSkills,
    initialProjects,
}) {
    const [isPending, startTransition] = useTransition();

    const [activeSkill, setActiveSkill] = useState(null);
    const [query, setQuery] = useState("");
    const [mode, setMode] = useState("all"); // all | skill | search
    const [projects, setProjects] = useState(initialProjects || []);
    const [backendStatus, setBackendStatus] = useState("checking"); // checking | ok | down
    const [error, setError] = useState(null);

    const profile = profileBundle?.profile;
    const work = profileBundle?.workExperience || [];

    useEffect(() => {
        let cancelled = false;
        fetch("/api/health", { cache: "no-store" })
            .then((r) => (r.ok ? r.json() : Promise.reject()))
            .then(() => {
                if (!cancelled) setBackendStatus("ok");
            })
            .catch(() => {
                if (!cancelled) setBackendStatus("down");
            });

        return () => {
            cancelled = true;
        };
    }, []);

    function loadAll() {
        setError(null);
        setActiveSkill(null);
        setMode("all");
        startTransition(async () => {
            try {
                const res = await fetch("/api/projects", { cache: "no-store" });
                const data = await res.json();
                if (!res.ok) throw new Error(data?.error || "Failed to load projects");
                setProjects(data);
            } catch (e) {
                setError(e.message || "Failed to load projects");
            }
        });
    }

    function loadBySkill(skill) {
        setError(null);
        setQuery("");
        setActiveSkill(skill);
        setMode("skill");
        startTransition(async () => {
            try {
                const url = new URL("/api/projects", window.location.origin);
                url.searchParams.set("skill", skill);
                const res = await fetch(url, { cache: "no-store" });
                const data = await res.json();
                if (!res.ok) throw new Error(data?.error || "Failed to load projects");
                setProjects(data);
            } catch (e) {
                setError(e.message || "Failed to load projects");
            }
        });
    }

    function runSearch() {
        const trimmed = query.trim();
        if (!trimmed) return;

        setError(null);
        setActiveSkill(null);
        setMode("search");
        startTransition(async () => {
            try {
                const url = new URL("/api/search", window.location.origin);
                url.searchParams.set("q", trimmed);
                const res = await fetch(url, { cache: "no-store" });
                const data = await res.json();
                if (!res.ok) throw new Error(data?.error || "Search failed");
                setProjects(data.projects || []);
            } catch (e) {
                setError(e.message || "Search failed");
            }
        });
    }

    const headline =
        mode === "search"
            ? `Search results (${projects.length})`
            : mode === "skill"
                ? `Projects tagged “${activeSkill}” (${projects.length})`
                : `Projects (${projects.length})`;

    return (
        <div className="min-h-screen bg-[radial-gradient(1200px_circle_at_10%_0%,rgba(34,211,238,0.22),transparent_55%),radial-gradient(1000px_circle_at_90%_10%,rgba(217,70,239,0.18),transparent_60%),linear-gradient(to_bottom,#f8fafc,#ffffff)]">
            <header className="mx-auto max-w-6xl px-6 pt-10">
                <div className="rounded-3xl border border-white/70 bg-white/60 p-8 shadow-sm backdrop-blur-sm">
                    <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                        <div>
                            <p className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700">
                                <span
                                    className={classNames(
                                        "h-2 w-2 rounded-full",
                                        backendStatus === "ok"
                                            ? "bg-emerald-500"
                                            : backendStatus === "down"
                                                ? "bg-rose-500"
                                                : "bg-amber-400"
                                    )}
                                />
                                API {backendStatus}
                            </p>
                            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">
                                {profile?.name || "Portfolio"}
                            </h1>
                            <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600">
                                {profile?.education ||
                                    "A lightweight portfolio page powered by your Express + Drizzle backend."}
                            </p>

                            <div className="mt-5 flex flex-wrap gap-3">
                                {profile?.email && (
                                    <a
                                        href={`mailto:${profile.email}`}
                                        className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                                    >
                                        Email
                                        <span className="text-white/70">↗</span>
                                    </a>
                                )}
                                {profile?.github && (
                                    <a
                                        href={profile.github}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-white"
                                    >
                                        GitHub
                                        <span className="text-slate-500">↗</span>
                                    </a>
                                )}
                                {profile?.linkedin && (
                                    <a
                                        href={profile.linkedin}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-white"
                                    >
                                        LinkedIn
                                        <span className="text-slate-500">↗</span>
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="w-full max-w-md rounded-2xl border border-white/70 bg-white/70 p-5">
                            <p className="text-sm font-semibold text-slate-900">Search projects</p>
                            <p className="mt-1 text-sm text-slate-600">
                                Search by title, description, or skill.
                            </p>

                            <div className="mt-4 flex gap-2">
                                <input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") runSearch();
                                    }}
                                    placeholder="Try: react, drizzle, postgres…"
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
                                />
                                <button
                                    type="button"
                                    onClick={runSearch}
                                    disabled={isPending}
                                    className="rounded-xl bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-60"
                                >
                                    Search
                                </button>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={loadAll}
                                    disabled={isPending}
                                    className="rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-white disabled:opacity-60"
                                >
                                    All projects
                                </button>
                                <span className="rounded-full bg-slate-900/5 px-3 py-1 text-xs font-medium text-slate-700">
                                    {isPending ? "Loading…" : headline}
                                </span>
                            </div>

                            {error && (
                                <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                                    {error}
                                </p>
                            )}
                        </div>
                    </div>

                    {!!(topSkills || []).length && (
                        <div className="mt-8">
                            <div className="flex items-end justify-between gap-4">
                                <div>
                                    <h2 className="text-sm font-semibold text-slate-900">Top skills</h2>
                                    <p className="mt-1 text-sm text-slate-600">
                                        Click a chip to filter projects.
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <SkillChip
                                    active={mode !== "search" && activeSkill === null}
                                    title="Show all projects"
                                    onClick={loadAll}
                                >
                                    All projects
                                </SkillChip>
                                {topSkills.map((row) => (
                                    <SkillChip
                                        key={row.skill}
                                        active={activeSkill === row.skill}
                                        title={`${row.skill} (${row.count})`}
                                        onClick={() => loadBySkill(row.skill)}
                                    >
                                        {row.skill}
                                        <span className="text-slate-400">·</span>
                                        <span className="text-slate-600">{row.count}</span>
                                    </SkillChip>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-6 pb-20 pt-10">
                <section>
                    <div className="flex items-end justify-between gap-4">
                        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                            {headline}
                        </h2>
                    </div>

                    <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {projects.map((p) => (
                            <ProjectCard key={p.id} project={p} />
                        ))}
                    </div>

                    {!projects.length && (
                        <div className="mt-6 rounded-2xl border border-white/70 bg-white/70 p-6 text-slate-700">
                            No projects matched.
                        </div>
                    )}
                </section>

                {!!work.length && (
                    <section className="mt-14">
                        <div className="flex items-end justify-between gap-4">
                            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                                Work experience
                            </h2>
                        </div>

                        <div className="mt-6 grid gap-5 md:grid-cols-2">
                            {work.map((w) => (
                                <div
                                    key={w.id}
                                    className="rounded-2xl border border-white/70 bg-white/70 p-6 shadow-sm"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-base font-semibold text-slate-900">{w.role}</p>
                                            <p className="mt-1 text-sm font-medium text-slate-700">{w.company}</p>
                                        </div>
                                        {w.duration && (
                                            <span className="rounded-full bg-slate-900/5 px-3 py-1 text-xs font-medium text-slate-700">
                                                {w.duration}
                                            </span>
                                        )}
                                    </div>
                                    {w.description && (
                                        <p className="mt-3 text-sm leading-6 text-slate-600">{w.description}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <footer className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/70 pt-8 sm:flex-row sm:items-center">
                    <p className="text-sm text-slate-600">
                        Powered by Express + Drizzle + Next.js.
                    </p>
                    <p className="text-xs text-slate-500">
                        Configure BACKEND_BASE_URL for deployments.
                    </p>
                </footer>
            </main>
        </div>
    );
}

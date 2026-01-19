"use client";

import { useEffect, useState, useTransition } from "react";
import { ProfileHeader } from "./ProfileHeader";
import { SearchBox } from "./SearchBox";
import { SkillChip } from "./SkillChip";
import { ProjectCard } from "./ProjectCard";
import { WorkCard } from "./WorkCard";

export default function PortfolioExplorer({
    profileBundle,
    topSkills,
    initialProjects,
}) {
    const [isPending, startTransition] = useTransition();

    const [activeSkill, setActiveSkill] = useState(null);
    const [query, setQuery] = useState("");
    const [mode, setMode] = useState("all");
    const [projects, setProjects] = useState(initialProjects || []);
    const [backendStatus, setBackendStatus] = useState("checking");
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
        setQuery("");
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
            ? `Search results`
            : mode === "skill"
                ? `${activeSkill}`
                : `All projects`;

    const projectCount = projects.length;

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
                {/* Header Section */}
                <header className="space-y-8">
                    <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                        <ProfileHeader profile={profile} backendStatus={backendStatus} />
                        <div className="w-full md:w-80 shrink-0">
                            <SearchBox
                                query={query}
                                setQuery={setQuery}
                                onSearch={runSearch}
                                isPending={isPending}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {/* Skills Filter */}
                    {!!(topSkills || []).length && (
                        <div className="space-y-3">
                            <p className="text-sm font-medium text-slate-700">Filter by skill</p>
                            <div className="flex flex-wrap gap-2">
                                <SkillChip
                                    active={mode === "all"}
                                    title="Show all projects"
                                    onClick={loadAll}
                                >
                                    All
                                </SkillChip>
                                {topSkills.map((row) => (
                                    <SkillChip
                                        key={row.skill}
                                        active={activeSkill === row.skill}
                                        title={`${row.count} projects`}
                                        onClick={() => loadBySkill(row.skill)}
                                    >
                                        {row.skill}
                                    </SkillChip>
                                ))}
                            </div>
                        </div>
                    )}
                </header>

                {/* Projects Section */}
                <section className="mt-12">
                    <div className="flex items-baseline justify-between gap-4 mb-6">
                        <h2 className="text-xl font-semibold text-slate-900">
                            {headline}
                        </h2>
                        <span className="text-sm text-slate-500">
                            {isPending ? "Loading..." : `${projectCount} project${projectCount !== 1 ? "s" : ""}`}
                        </span>
                    </div>

                    {projects.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {projects.map((p) => (
                                <ProjectCard key={p.id} project={p} />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
                            <p className="text-slate-500">No projects found</p>
                        </div>
                    )}
                </section>

                {/* Work Experience Section */}
                {!!work.length && (
                    <section className="mt-16">
                        <h2 className="text-xl font-semibold text-slate-900 mb-6">
                            Experience
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {work.map((w) => (
                                <WorkCard key={w.id} work={w} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}

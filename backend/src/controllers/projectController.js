import { and, eq, ilike, inArray, or, sql } from 'drizzle-orm';
import { db } from '../db/client.js';
import { projects, projectSkills } from '../db/schema.js';

function normalizePattern(value) {
    return `%${value}%`;
}

async function fetchSkillsForProjects(projectIds) {
    if (!projectIds.length) return {};

    const rows = await db
        .select({ projectId: projectSkills.projectId, skill: projectSkills.skill })
        .from(projectSkills)
        .where(inArray(projectSkills.projectId, projectIds));

    return rows.reduce((acc, row) => {
        if (!acc[row.projectId]) acc[row.projectId] = [];
        acc[row.projectId].push(row.skill);
        return acc;
    }, {});
}

export async function getProjects(req, res, next) {
    try {
        const { skill, q } = req.query;
        const conditions = [];
        const skillFilter = skill ? ilike(projectSkills.skill, normalizePattern(skill)) : null;
        const textFilter = q
            ? or(
                ilike(projects.title, normalizePattern(q)),
                ilike(projects.description, normalizePattern(q))
            )
            : null;

        if (skillFilter) conditions.push(skillFilter);
        if (textFilter) conditions.push(textFilter);

        const whereClause = conditions.length ? and(...conditions) : undefined;

        const rows = skill
            ? await db
                .select({
                    id: projects.id,
                    profileId: projects.profileId,
                    title: projects.title,
                    description: projects.description,
                    links: projects.links,
                    skill: projectSkills.skill,
                })
                .from(projects)
                .innerJoin(projectSkills, eq(projectSkills.projectId, projects.id))
                .where(whereClause)
            : await db
                .select({
                    id: projects.id,
                    profileId: projects.profileId,
                    title: projects.title,
                    description: projects.description,
                    links: projects.links,
                })
                .from(projects)
                .where(whereClause);

        const deduped = new Map();
        for (const row of rows) {
            const existing = deduped.get(row.id) || {
                id: row.id,
                profileId: row.profileId,
                title: row.title,
                description: row.description,
                links: row.links,
                skills: [],
            };
            if (row.skill && !existing.skills.includes(row.skill)) {
                existing.skills.push(row.skill);
            }
            deduped.set(row.id, existing);
        }

        const projectsList = Array.from(deduped.values());
        const needsSkillsLookup = projectsList.some((p) => p.skills.length === 0);
        if (needsSkillsLookup && projectsList.length) {
            const skillMap = await fetchSkillsForProjects(projectsList.map((p) => p.id));
            projectsList.forEach((p) => {
                p.skills = skillMap[p.id] || p.skills;
            });
        }

        res.json(projectsList);
    } catch (err) {
        next(err);
    }
}

export async function getTopSkills(req, res, next) {
    try {
        const limit = Number.parseInt(req.query.limit ?? '10', 10);
        const safeLimit = Number.isNaN(limit) ? 10 : Math.min(Math.max(limit, 1), 100);

        const rows = await db
            .select({
                skill: projectSkills.skill,
                count: sql`COUNT(*)`.mapWith(Number),
            })
            .from(projectSkills)
            .groupBy(projectSkills.skill)
            .orderBy(sql`COUNT(*) DESC`)
            .limit(safeLimit);

        res.json(rows);
    } catch (err) {
        next(err);
    }
}

export async function search(req, res, next) {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ error: 'q query param is required' });

        const pattern = normalizePattern(q);
        const rows = await db
            .select({
                id: projects.id,
                profileId: projects.profileId,
                title: projects.title,
                description: projects.description,
                links: projects.links,
                skill: projectSkills.skill,
            })
            .from(projects)
            .leftJoin(projectSkills, eq(projectSkills.projectId, projects.id))
            .where(
                or(
                    ilike(projects.title, pattern),
                    ilike(projects.description, pattern),
                    ilike(projectSkills.skill, pattern)
                )
            );

        const deduped = new Map();
        for (const row of rows) {
            const existing = deduped.get(row.id) || {
                id: row.id,
                profileId: row.profileId,
                title: row.title,
                description: row.description,
                links: row.links,
                skills: [],
            };
            if (row.skill && !existing.skills.includes(row.skill)) {
                existing.skills.push(row.skill);
            }
            deduped.set(row.id, existing);
        }

        res.json({ projects: Array.from(deduped.values()) });
    } catch (err) {
        next(err);
    }
}

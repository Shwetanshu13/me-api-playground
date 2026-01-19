import { asc, eq, inArray } from 'drizzle-orm';
import { db } from '../db/client.js';
import { profiles, projects, projectSkills, workExperience } from '../db/schema.js';

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

export async function getProfile(req, res, next) {
    try {
        const [profile] = await db.select().from(profiles).orderBy(asc(profiles.id)).limit(1);
        if (!profile) return res.status(404).json({ error: 'profile not found' });
        const profileId = profile.id;

        const projectRows = await db
            .select()
            .from(projects)
            .where(eq(projects.profileId, profileId));
        const projectIds = projectRows.map((p) => p.id);
        const skillMap = await fetchSkillsForProjects(projectIds);
        const projectsWithSkills = projectRows.map((p) => ({ ...p, skills: skillMap[p.id] || [] }));

        const workRows = await db
            .select()
            .from(workExperience)
            .where(eq(workExperience.profileId, profileId));

        res.json({ profile, projects: projectsWithSkills, workExperience: workRows });
    } catch (err) {
        next(err);
    }
}

import 'dotenv/config';
import { db, pool } from '../src/db/client.js';
import { profiles, projects, projectSkills, workExperience } from '../src/db/schema.js';

async function main() {
    // Clear existing data (order matters)
    await db.delete(projectSkills);
    await db.delete(projects);
    await db.delete(workExperience);
    await db.delete(profiles);

    // ---------------- PROFILE ----------------
    const [profile] = await db
        .insert(profiles)
        .values({
            name: 'Shwetanshu Sinha',
            email: 'shwetanshusinha13@gmail.com',
            education: 'B.Tech in Computer Science from NIT Delhi',
            github: 'https://github.com/Shwetanshu13',
            linkedin: 'https://www.linkedin.com/in/shwetanshu-sinha-368726280/',
            portfolio: 'https://shwetanshusinha.vercel.app',
        })
        .returning();

    // ---------------- PROJECTS ----------------
    const projectRows = await db
        .insert(projects)
        .values([
            {
                profileId: profile.id,
                title: 'You-Listen',
                description:
                    'Music streaming web platform with secure playback, playlists, and authentication.',
                links: ['https://github.com/Shwetanshu13/you-listen', 'https://you-listen.vercel.app'],
            },
            {
                profileId: profile.id,
                title: 'You-Listen-App',
                description:
                    'React Native Expo mobile app for You-Listen with playlist support.',
                links: ['https://github.com/Shwetanshu13/you-listen-app'],
            },
            {
                profileId: profile.id,
                title: 'AI-DSA',
                description:
                    'AI-guided DSA learning platform using Next.js, Express, OpenAI, PostgreSQL, and MongoDB.',
                links: ['https://github.com/Shwetanshu13/ai-dsa'],
            },
            {
                profileId: profile.id,
                title: 'Yes Chef',
                description:
                    'Recipe management and discovery platform with advanced filtering built using Next.js and PostgreSQL.',
                links: ['https://github.com/Shwetanshu13/yes-chef', 'https://yes-chef-sh.vercel.app'],
            },
            {
                profileId: profile.id,
                title: 'Vashu Bulks',
                description:
                    'AI-powered nutrition and inventory tracking mobile app built with React Native Expo.',
                links: ['https://github.com/Shwetanshu13/vashu-bulks', 'https://vashu-bulks.vercel.app'],
            },
            {
                profileId: profile.id,
                title: 'Justoo',
                description:
                    'Full-stack web application focused on ordering and management workflows.',
                links: ['https://github.com/Shwetanshu13/justoo'],
            },
        ])
        .returning();

    // Destructure in exact insert order
    const [
        youListen,
        youListenApp,
        aiDsa,
        yesChef,
        vashuBulks,
        justoo,
    ] = projectRows;

    // ---------------- PROJECT SKILLS ----------------
    await db.insert(projectSkills).values([
        // You-Listen (Web)
        { projectId: youListen.id, skill: 'Docker' },
        { projectId: youListen.id, skill: 'Next.js' },
        { projectId: youListen.id, skill: 'Node.js' },
        { projectId: youListen.id, skill: 'Express' },
        { projectId: youListen.id, skill: 'PostgreSQL' },

        // You-Listen-App (Mobile)
        { projectId: youListenApp.id, skill: 'React Native' },
        { projectId: youListenApp.id, skill: 'Expo' },

        // AI-DSA
        { projectId: aiDsa.id, skill: 'BullMQ' },
        { projectId: aiDsa.id, skill: 'Next.js' },
        { projectId: aiDsa.id, skill: 'Node.js' },
        { projectId: aiDsa.id, skill: 'Express' },
        { projectId: aiDsa.id, skill: 'OpenAI' },
        { projectId: aiDsa.id, skill: 'PostgreSQL' },
        { projectId: aiDsa.id, skill: 'MongoDB' },

        // Yes Chef
        { projectId: yesChef.id, skill: 'Next.js' },
        { projectId: yesChef.id, skill: 'PostgreSQL' },
        { projectId: yesChef.id, skill: 'Tailwind CSS' },

        // Vashu Bulks
        { projectId: vashuBulks.id, skill: 'React Native' },
        { projectId: vashuBulks.id, skill: 'Expo' },
        { projectId: vashuBulks.id, skill: 'AI/ML' },

        // Justoo
        { projectId: justoo.id, skill: 'React' },
        { projectId: justoo.id, skill: 'Node.js' },
        { projectId: justoo.id, skill: 'Express' },
        { projectId: justoo.id, skill: 'MongoDB' },
    ]);

    // ---------------- WORK EXPERIENCE ----------------
    await db.insert(workExperience).values([
        {
            profileId: profile.id,
            company: 'ShuniyaVigyan',
            role: 'Frontend Stack Developer',
            duration: 'April 2024 - May 2024',
            description:
                'Worked on production-grade web and AI projects, implementing real-world frontend and full-stack features.',
        },
    ]);

    console.log('✅ Seed data inserted successfully');
}

main()
    .catch((err) => {
        console.error('❌ Seeding failed:', err);
        process.exitCode = 1;
    })
    .finally(async () => {
        await pool.end();
    });

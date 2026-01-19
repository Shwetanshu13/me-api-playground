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
        { projectId: youListen.id, skill: 'next' },
        { projectId: youListen.id, skill: 'node' },
        { projectId: youListen.id, skill: 'express' },
        { projectId: youListen.id, skill: 'postgres' },
        { projectId: youListen.id, skill: 'docker' },

        // You-Listen-App (Mobile)
        { projectId: youListenApp.id, skill: 'react-native' },
        { projectId: youListenApp.id, skill: 'expo' },

        // AI-DSA
        { projectId: aiDsa.id, skill: 'nextjs' },
        { projectId: aiDsa.id, skill: 'node' },
        { projectId: aiDsa.id, skill: 'express' },
        { projectId: aiDsa.id, skill: 'openai' },
        { projectId: aiDsa.id, skill: 'postgres' },
        { projectId: aiDsa.id, skill: 'mongodb' },

        // Yes Chef
        { projectId: yesChef.id, skill: 'nextjs' },
        { projectId: yesChef.id, skill: 'postgres' },
        { projectId: yesChef.id, skill: 'tailwind' },

        // Vashu Bulks
        { projectId: vashuBulks.id, skill: 'react-native' },
        { projectId: vashuBulks.id, skill: 'expo' },
        { projectId: vashuBulks.id, skill: 'ai' },

        // Justoo
        { projectId: justoo.id, skill: 'react' },
        { projectId: justoo.id, skill: 'node' },
        { projectId: justoo.id, skill: 'express' },
        { projectId: justoo.id, skill: 'mongodb' },
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

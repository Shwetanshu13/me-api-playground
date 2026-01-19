import { pgTable, serial, varchar, text, integer, primaryKey } from 'drizzle-orm/pg-core';

export const profiles = pgTable('profiles', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 320 }).notNull().unique(),
    education: text('education'),
    github: varchar('github', { length: 255 }),
    linkedin: varchar('linkedin', { length: 255 }),
    portfolio: varchar('portfolio', { length: 255 }),
});

export const projects = pgTable('projects', {
    id: serial('id').primaryKey(),
    profileId: integer('profile_id')
        .notNull()
        .references(() => profiles.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    links: text('links').array(),
});

export const projectSkills = pgTable(
    'project_skills',
    {
        projectId: integer('project_id')
            .notNull()
            .references(() => projects.id, { onDelete: 'cascade' }),
        skill: varchar('skill', { length: 100 }).notNull(),
    },
    (table) => ({
        pk: primaryKey({ columns: [table.projectId, table.skill] }),
    })
);

export const workExperience = pgTable('work_experience', {
    id: serial('id').primaryKey(),
    profileId: integer('profile_id')
        .notNull()
        .references(() => profiles.id, { onDelete: 'cascade' }),
    company: varchar('company', { length: 255 }).notNull(),
    role: varchar('role', { length: 255 }).notNull(),
    duration: varchar('duration', { length: 255 }),
    description: text('description'),
});

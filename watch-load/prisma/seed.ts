import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };

async function main() {
    console.log('Seeding database...');

    // --- USERS ---
    const admin = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            id: 'ckm4b2ttd0000gnr61tkc1djd',
            username: 'admin',
            password:
                '$2a$12$v61otLTs7yf/NtH9a4.EA.dQCfA9qZwC5gy6jR0A.LQ.aQI1FsQ5y',
            role: 'ADMIN',
            name: 'Jonny Tester',
        },
    });

    const jimmy = await prisma.user.upsert({
        where: { username: 'user' },
        update: {},
        create: {
            id: 'cmngafhv100032a6iu7st4mm8',
            username: 'user',
            password:
                '$2a$12$VSYVchlRN2bDTm/v9iQhW.iejCdpgByY416gMe9GNoY7GW4pH627C',
            role: 'USER',
            name: 'Jimmy User',
        },
    });

    const james = await prisma.user.upsert({
        where: { username: 'user2' },
        update: {},
        create: {
            id: 'cmngafkfw00092a6it9xer5qm',
            username: 'user2',
            password:
                '$2a$12$TkBN1iu95ZSoMt3ROtuOWebQOqkZcXOXvsiXzOmdLOGkI38psUz/6',
            role: 'USER',
            name: 'James User',
        },
    });

    // --- WORKSPACES ---
    const jimmysWorkspace = await prisma.workspace.upsert({
        where: { slug: 'jimmys-workspace' },
        update: {},
        create: {
            id: 'cmngaj1zf00072a6itpsrp8ah',
            name: 'Jimmys Workspace',
            description: 'This is Jimmys workspace',
            slug: 'jimmys-workspace',
        },
    });

    const jamesWorkspace = await prisma.workspace.upsert({
        where: { slug: 'james-workspace' },
        update: {},
        create: {
            id: 'cmngal4g8000b2a6iwthrdnnn',
            name: 'James Workspace',
            description: 'This is James workspace',
            slug: 'james-workspace',
        },
    });

    // --- MEMBERSHIPS ---
    await prisma.membership.upsert({
        where: {
            userId_workspaceId: {
                userId: jimmy.id,
                workspaceId: jimmysWorkspace.id,
            },
        },
        update: {},
        create: {
            id: 'cmngan6ut000f2a6ihq07flgb',
            userId: jimmy.id,
            workspaceId: jimmysWorkspace.id,
            workspaceRole: 'WORKSPACE_ADMIN',
        },
    });

    await prisma.membership.upsert({
        where: {
            userId_workspaceId: {
                userId: james.id,
                workspaceId: jamesWorkspace.id,
            },
        },
        update: {},
        create: {
            id: 'cmngapxl8000j2a6i6i1i3grd',
            userId: james.id,
            workspaceId: jamesWorkspace.id,
            workspaceRole: 'WORKSPACE_ADMIN',
        },
    });

    console.log('Seeding completed successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

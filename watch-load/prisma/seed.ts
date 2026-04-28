import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Seeding database...');

    // --- USERS ---
    await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            id: 'ckm4b2ttd0000gnr61tkc1djd',
            username: 'admin',
            password:
                '$2a$12$v61otLTs7yf/NtH9a4.EA.dQCfA9qZwC5gy6jR0A.LQ.aQI1FsQ5y',
            role: 'ADMIN',
            name: 'Jonny Tester',
            resetToken: null,
            resetTokenExpiresAt: new Date(),
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
            resetToken: null,
            resetTokenExpiresAt: new Date(),
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
            resetToken: null,
            resetTokenExpiresAt: new Date(),
        },
    });

    const jane = await prisma.user.upsert({
        where: { username: 'test' },
        update: {},
        create: {
            id: 'cmnkeq3j800052a6imq245cr2',
            username: 'test',
            password:
                '$2a$12$YevL//FqxhoK0b4pVdfTq.jmV9ImnmffrffNdYpaQacsuq25OXptC',
            role: 'USER',
            name: 'Jane User',
            resetToken: null,
            resetTokenExpiresAt: new Date(),
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

    await prisma.membership.upsert({
        where: {
            userId_workspaceId: {
                userId: jane.id,
                workspaceId: jimmysWorkspace.id,
            },
        },
        update: {},
        create: {
            id: 'cmnkeqse400092a6imxklf373',
            userId: jane.id,
            workspaceId: jimmysWorkspace.id,
            workspaceRole: 'WORKSPACE_USER',
        },
    });

    await prisma.membership.upsert({
        where: {
            userId_workspaceId: {
                userId: jane.id,
                workspaceId: jamesWorkspace.id,
            },
        },
        update: {},
        create: {
            id: 'cmnkerkbn000d2a6iu4548iqj',
            userId: jane.id,
            workspaceId: jamesWorkspace.id,
            workspaceRole: 'WORKSPACE_USER',
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

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const scooters = await prisma.scooter.findMany({
        select: { id: true, name: true, hostId: true }
    });

    const profiles = await prisma.hostProfile.findMany({
        select: { id: true, userId: true }
    });

    console.log("SCOOTERS:", JSON.stringify(scooters, null, 2));
    console.log("HOST PROFILES:", JSON.stringify(profiles, null, 2));

    const profileIds = new Set(profiles.map(p => p.id));
    const orphaned = scooters.filter(s => s.hostId && !profileIds.has(s.hostId));

    console.log("ORPHANED SCOOTERS:", JSON.stringify(orphaned, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());

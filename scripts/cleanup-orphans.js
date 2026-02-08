const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Fetching profiles and scooters...");
    const profiles = await prisma.hostProfile.findMany({ select: { id: true } });
    const profileIds = new Set(profiles.map(p => p.id));
    const scooters = await prisma.scooter.findMany({ select: { id: true, hostId: true } });

    console.log(`Found ${profiles.length} profiles and ${scooters.length} scooters.`);

    for (const s of scooters) {
        if (s.hostId && !profileIds.has(s.hostId)) {
            console.log(`Nullifying hostId for scooter ${s.id} (current hostId: ${s.hostId})`);
            await prisma.scooter.update({
                where: { id: s.id },
                data: { hostId: null }
            });
        }
    }
    console.log("Cleanup finished.");
}

main().catch(console.error).finally(() => prisma.$disconnect());

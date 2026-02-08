const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Counting roles...");
    const counts = await prisma.user.groupBy({
        by: ['role'],
        _count: { _all: true }
    });
    console.log("Role counts:", counts);

    console.log("Recent users (last 10):");
    const recentUsers = await prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { hostProfile: true }
    });
    console.log(JSON.stringify(recentUsers, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

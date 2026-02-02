const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Fetching scooters...");
    const scooters = await prisma.scooter.findMany();
    console.log("Scooters in DB:");
    scooters.forEach(s => {
        console.log(`- ID: ${s.id}, Name: ${s.name}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });

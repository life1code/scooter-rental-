const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Starting migration...");

    // 1. Find all users with host role
    const hostUsers = await prisma.user.findMany({
        where: { role: "host" }
    });

    console.log(`Found ${hostUsers.length} host users.`);

    for (const hostUser of hostUsers) {
        // Check if profile exists
        const existingProfile = await prisma.hostProfile.findUnique({
            where: { userId: hostUser.id }
        });

        if (!existingProfile) {
            console.log(`Creating HostProfile for ${hostUser.email}...`);
            const profile = await prisma.hostProfile.create({
                data: {
                    userId: hostUser.id,
                    institutionName: hostUser.name || "Legacy Shop",
                    institutionAddress: "Migrated from legacy system",
                    nicNumber: "MIGRATED",
                    nicPhoto: "https://via.placeholder.com/400",
                    phoneNumber: "0000000000",
                    approvalStatus: "approved"
                }
            });

            // 2. Update Scooters that were pointing to this User.id
            // We need to use raw query or temporary detached state
            // Since the relation is currently detached in schema.prisma, we can just update the hostId string
            const updatedScooters = await prisma.scooter.updateMany({
                where: { hostId: hostUser.id },
                data: { hostId: profile.id }
            });
            console.log(`Updated ${updatedScooters.count} scooters for ${hostUser.email}.`);
        }
    }

    console.log("Migration completed.");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

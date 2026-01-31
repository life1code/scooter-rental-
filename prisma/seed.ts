import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { SCOOTERS } from '../src/backend/data/scooters';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    try {
        for (const scooter of SCOOTERS) {
            await prisma.scooter.create({
                data: {
                    name: scooter.name,
                    type: scooter.type,
                    pricePerDay: scooter.pricePerDay,
                    rating: scooter.rating,
                    reviews: scooter.reviews,
                    image: scooter.image,
                    description: scooter.description,
                    specs: scooter.specs, // Prisma handles JSON automatically
                    isSpotlight: scooter.isSpotlight || false,
                    manufacturerUrl: scooter.manufacturerUrl,
                    location: scooter.location || 'Unawatuna',
                    ownerName: scooter.ownerName || 'Ride Owner',
                    ownerWhatsapp: scooter.ownerWhatsapp || '+94700000000',
                },
            });
            console.log(`Created scooter: ${scooter.name}`);
        }
        console.log('Seeding finished.');
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();

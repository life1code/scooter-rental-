import { NextResponse } from "next/server";
import { prisma } from "@/backend/lib/db";
import { SCOOTERS } from "@/backend/data/scooters";

export const dynamic = 'force-dynamic'; // Ensure this route is never cached

export async function GET() {
    try {
        console.log("Starting remote database seed...");
        const createdScooters = [];

        for (const scooter of SCOOTERS) {
            const result = await prisma.scooter.upsert({
                where: { id: scooter.id },
                update: {
                    name: scooter.name,
                    type: scooter.type,
                    pricePerDay: scooter.pricePerDay,
                    rating: scooter.rating,
                    reviews: scooter.reviews,
                    image: scooter.image,
                    description: scooter.description,
                    specs: scooter.specs as any,
                    isSpotlight: scooter.isSpotlight || false,
                    manufacturerUrl: scooter.manufacturerUrl,
                    location: scooter.location || 'Unawatuna',
                    ownerName: scooter.ownerName || 'Ride Owner',
                    ownerWhatsapp: scooter.ownerWhatsapp || '+94700000000',
                },
                create: {
                    id: scooter.id,
                    name: scooter.name,
                    type: scooter.type,
                    pricePerDay: scooter.pricePerDay,
                    rating: scooter.rating,
                    reviews: scooter.reviews,
                    image: scooter.image,
                    description: scooter.description,
                    specs: scooter.specs as any,
                    isSpotlight: scooter.isSpotlight || false,
                    manufacturerUrl: scooter.manufacturerUrl,
                    location: scooter.location || 'Unawatuna',
                    ownerName: scooter.ownerName || 'Ride Owner',
                    ownerWhatsapp: scooter.ownerWhatsapp || '+94700000000',
                    status: 'Available'
                }
            });
            createdScooters.push(result.name);
        }

        return NextResponse.json({
            message: "Seeding finished successfully",
            count: createdScooters.length,
            scooters: createdScooters
        });
    } catch (error) {
        console.error("Seeding failed:", error);
        return NextResponse.json(
            { error: "Seeding failed", details: String(error) },
            { status: 500 }
        );
    }
}

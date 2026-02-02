import { NextResponse } from "next/server";
import { prisma } from "@/backend/lib/db";
import { SCOOTERS } from "@/backend/data/scooters";

export async function GET() {
    try {
        console.log(`Seeding ${SCOOTERS.length} scooters...`);
        const results = [];

        for (const scooter of SCOOTERS) {
            const result = await prisma.scooter.upsert({
                where: { id: scooter.id },
                update: {
                    ...scooter,
                    pricePerDay: Number(scooter.pricePerDay),
                    rating: Number(scooter.rating),
                    reviews: Number(scooter.reviews),
                    specs: scooter.specs
                },
                create: {
                    ...scooter,
                    pricePerDay: Number(scooter.pricePerDay),
                    rating: Number(scooter.rating),
                    reviews: Number(scooter.reviews),
                    specs: scooter.specs
                }
            });
            results.push(result.name);
        }

        return NextResponse.json({
            success: true,
            message: `Successfully seeded ${results.length} scooters`,
            scooters: results
        });
    } catch (error: any) {
        console.error("Seeding error:", error);
        return NextResponse.json(
            { error: "Failed to seed database", details: error.message },
            { status: 500 }
        );
    }
}

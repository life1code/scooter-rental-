import { NextResponse } from "next/server";
import { prisma } from "@/backend/lib/db";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const spotlight = searchParams.get('spotlight') === 'true';

        let whereConfig = {};
        if (spotlight) {
            whereConfig = { isSpotlight: true };
        }

        const scooters = await prisma.scooter.findMany({
            where: whereConfig,
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(scooters);
    } catch (error) {
        console.error("Error fetching scooters:", error);
        return NextResponse.json({ error: "Failed to fetch scooters" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Basic validation could go here

        const newScooter = await prisma.scooter.create({
            data: {
                name: body.name,
                type: body.type,
                pricePerDay: body.pricePerDay,
                image: body.image,
                rating: body.rating || 5.0,
                description: body.description || "No description provided.",
                specs: body.specs,
                isSpotlight: body.isSpotlight || false,
                manufacturerUrl: body.manufacturerUrl,
                location: body.location,
                ownerName: body.ownerName,
                ownerWhatsapp: body.ownerWhatsapp,
                status: body.status || "Available"
            }
        });

        return NextResponse.json(newScooter, { status: 201 });
    } catch (error) {
        console.error("Error creating scooter:", error);
        return NextResponse.json({ error: "Failed to create scooter" }, { status: 500 });
    }
}

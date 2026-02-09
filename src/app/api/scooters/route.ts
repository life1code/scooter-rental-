import { NextResponse } from "next/server";
import { prisma } from "@/backend/lib/db";
import { uploadScooterPhoto } from "@/backend/lib/s3-utils";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url, "http://localhost");
        const spotlight = searchParams.get('spotlight') === 'true';

        let whereConfig = {};
        if (spotlight) {
            whereConfig = { isSpotlight: true };
        }

        const scooters = await prisma.scooter.findMany({
            where: whereConfig,
            orderBy: [
                { position: 'asc' },
                { createdAt: 'desc' }
            ]
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

        // Handle image upload to S3 if base64 image is provided
        let imageUrl = body.image;
        if (body.image && body.image.startsWith("data:image")) {
            try {
                const fileName = `${body.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.jpg`;
                imageUrl = await uploadScooterPhoto(body.image, fileName);
                console.log("Image uploaded to S3:", imageUrl);
            } catch (s3Error: any) {
                console.error("S3 Upload Failed:", s3Error);
                return NextResponse.json({
                    error: "Failed to upload image to S3",
                    details: s3Error.message
                }, { status: 500 });
            }
        }

        const newScooter = await prisma.scooter.create({
            data: {
                name: body.name,
                model: body.model || "Standard",
                type: body.type,
                pricePerDay: body.pricePerDay,
                image: imageUrl,
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
    } catch (error: any) {
        console.error("Error creating scooter:", error);
        return NextResponse.json({
            error: "Failed to create scooter",
            details: error.message || "Unknown error"
        }, { status: 500 });
    }
}

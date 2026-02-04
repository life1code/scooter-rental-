import { NextResponse } from "next/server";
import { prisma } from "@/backend/lib/db";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { lat, lng } = await request.json();

        if (!lat || !lng) {
            return NextResponse.json({ error: "Missing lat/lng" }, { status: 400 });
        }

        const updatedBooking = await prisma.booking.update({
            where: { id },
            data: {
                lastLat: lat,
                lastLng: lng,
                scooter: {
                    update: {
                        lastLat: lat,
                        lastLng: lng
                    }
                }
            }
        });

        return NextResponse.json(updatedBooking);
    } catch (error) {
        console.error("Failed to update location:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

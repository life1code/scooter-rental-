import { NextResponse } from "next/server";
import { prisma } from "@/backend/lib/db";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { lat, lng } = body;

        if (lat === undefined || lng === undefined) {
            return NextResponse.json({ error: "Missing lat/lng" }, { status: 400 });
        }

        const updatedBooking = await prisma.booking.update({
            where: { id },
            data: {
                lastLat: parseFloat(lat),
                lastLng: parseFloat(lng),
            },
        });

        return NextResponse.json(updatedBooking);
    } catch (error) {
        console.error("Error updating location:", error);
        return NextResponse.json({ error: "Failed to update location" }, { status: 500 });
    }
}

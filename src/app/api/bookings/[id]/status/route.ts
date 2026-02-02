import { NextResponse } from "next/server";
import { prisma } from "@/backend/lib/db";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status } = body;

        if (!status) {
            return NextResponse.json({ error: "Missing status" }, { status: 400 });
        }

        const updatedBooking = await prisma.booking.update({
            where: { id },
            data: { status },
        });

        return NextResponse.json(updatedBooking);
    } catch (error) {
        console.error("Error updating booking status:", error);
        return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
import { prisma } from "@/backend/lib/db";

export async function POST(request: Request) {
    try {
        const { orderedIds } = await request.json();

        if (!orderedIds || !Array.isArray(orderedIds)) {
            return NextResponse.json({ error: "Invalid input" }, { status: 400 });
        }

        // Update positions in a transaction
        await prisma.$transaction(
            orderedIds.map((id, index) =>
                prisma.scooter.update({
                    where: { id },
                    data: { position: index }
                })
            )
        );

        return NextResponse.json({ message: "Positions updated successfully" });
    } catch (error: any) {
        console.error("Error reordering scooters:", error);
        return NextResponse.json({
            error: "Failed to reorder scooters",
            details: error.message || "Unknown error"
        }, { status: 500 });
    }
}

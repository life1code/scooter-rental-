import { NextResponse } from "next/server";
import { prisma } from "@/backend/lib/db";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { orders } = body; // Array of { id: string, displayOrder: number }

        if (!orders || !Array.isArray(orders)) {
            return NextResponse.json({ error: "Invalid orders format" }, { status: 400 });
        }

        // Perform bulk updates in a transaction
        await prisma.$transaction(
            orders.map((item: { id: string, displayOrder: number }) =>
                prisma.scooter.update({
                    where: { id: item.id },
                    data: { displayOrder: item.displayOrder }
                })
            )
        );

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error reordering scooters:", error);
        return NextResponse.json({
            error: "Failed to reorder scooters",
            details: error.message || "Unknown error"
        }, { status: 500 });
    }
}

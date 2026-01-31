import { NextResponse } from "next/server";
import { prisma } from "@/backend/lib/db";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const scooter = await prisma.scooter.findUnique({
            where: { id: id }
        });

        if (!scooter) {
            return NextResponse.json({ error: "Scooter not found" }, { status: 404 });
        }

        return NextResponse.json(scooter);
    } catch (error) {
        console.error("Error fetching scooter:", error);
        return NextResponse.json({ error: "Failed to fetch scooter", details: String(error) }, { status: 500 });
    }
}

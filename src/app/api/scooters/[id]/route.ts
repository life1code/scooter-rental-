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
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.scooter.delete({
            where: { id: id }
        });

        return NextResponse.json({ message: "Scooter deleted successfully" });
    } catch (error) {
        console.error("Error deleting scooter:", error);
        return NextResponse.json({ error: "Failed to delete scooter" }, { status: 500 });
    }
}

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

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const updatedScooter = await prisma.scooter.update({
            where: { id: id },
            data: {
                name: body.name,
                model: body.model,
                type: body.type,
                pricePerDay: body.pricePerDay,
                image: body.image,
                rating: body.rating,
                description: body.description,
                specs: body.specs,
                isSpotlight: body.isSpotlight,
                manufacturerUrl: body.manufacturerUrl,
                location: body.location,
                ownerName: body.ownerName,
                ownerWhatsapp: body.ownerWhatsapp,
                status: body.status || "Available"
            }
        });

        return NextResponse.json(updatedScooter);
    } catch (error: any) {
        console.error("Error updating scooter:", error);
        return NextResponse.json({
            error: "Failed to update scooter",
            details: error.message || "Unknown error"
        }, { status: 500 });
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

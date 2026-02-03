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

        // If status is 'Active', also verify the customer
        const dataToUpdate: any = { status };
        if (status === 'Active') {
            dataToUpdate.verificationStatus = 'Verified';
        }

        const updatedBooking = await prisma.booking.update({
            where: { id },
            data: dataToUpdate,
        });

        return NextResponse.json(updatedBooking);
    } catch (error) {
        console.error("Error updating booking status:", error);
        return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
    }
}

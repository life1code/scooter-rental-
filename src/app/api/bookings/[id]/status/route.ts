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
            include: { scooter: true } // Include scooter details for email
        });

        // Send confirmation email if status changes to Active (Approved)
        if (status === 'Active' && updatedBooking.riderEmail) {
            try {
                await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/email/notify`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'approval',
                        booking: {
                            id: updatedBooking.id,
                            rider: updatedBooking.riderName,
                            riderEmail: updatedBooking.riderEmail,
                            bike: updatedBooking.scooter.name,
                            ownerWhatsapp: updatedBooking.scooter.ownerWhatsapp
                        }
                    })
                });
                console.log(`📧 Approval email sent to ${updatedBooking.riderEmail}`);
            } catch (emailError) {
                console.error("Failed to send approval email:", emailError);
            }
        }

        return NextResponse.json(updatedBooking);
    } catch (error) {
        console.error("Error updating booking status:", error);
        return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
    }
}

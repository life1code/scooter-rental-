import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/backend/lib/db";

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        const bookingId = params.id;

        // Fetch the booking to verify ownership or admin status
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { scooter: true }
        });

        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        // Authorization check
        const userEmail = session?.user?.email;
        const userId = (session?.user as any)?.id;
        const ADMIN_EMAILS = ['rydexpvtltd@gmail.com', 'smilylife996cha@gmail.com'];
        const isAdmin = userEmail && ADMIN_EMAILS.includes(userEmail);

        const isOwner = (userId && booking.userId === userId) || (userEmail && booking.riderEmail === userEmail);

        if (!isAdmin && !isOwner) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Only allow cancelling Pending bookings for now (or Active if business rules allow)
        if (booking.status === "Cancelled") {
            return NextResponse.json({ error: "Booking is already cancelled" }, { status: 400 });
        }

        if (booking.status === "Completed") {
            return NextResponse.json({ error: "Cannot cancel a completed booking" }, { status: 400 });
        }

        // Update booking status
        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: "Cancelled",
                verificationStatus: "Rejected" // Mark as rejected if it was pending verification
            }
        });

        console.log(`✅ Booking ${bookingId} cancelled by ${userEmail || "Guest"}`);

        return NextResponse.json(updatedBooking);
    } catch (error: any) {
        console.error("Error cancelling booking:", error);
        return NextResponse.json(
            { error: "Failed to cancel booking", details: error.message },
            { status: 500 }
        );
    }
}

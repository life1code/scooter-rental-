import { NextResponse } from "next/server";
import { prisma } from "@/backend/lib/db";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log("Received booking request for scooter:", body.scooterId);

        // Log payload size roughly
        const payloadSize = JSON.stringify(body).length;
        console.log(`Payload size: ${Math.round(payloadSize / 1024)}KB`);

        // Validate required fields
        if (!body.scooterId || !body.riderName || !body.riderPhone || !body.riderPassport) {
            console.error("Missing required fields:", {
                scooterId: !!body.scooterId,
                riderName: !!body.riderName,
                riderPhone: !!body.riderPhone,
                riderPassport: !!body.riderPassport
            });
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const booking = await prisma.booking.create({
            data: {
                scooterId: body.scooterId,
                userId: body.userId || null,
                riderName: body.riderName,
                riderEmail: body.riderEmail,
                riderPhone: body.riderPhone,
                riderPassport: body.riderPassport,
                startDate: new Date(body.startDate),
                endDate: new Date(body.endDate), // Ensure valid date object
                totalAmount: Number(body.totalAmount), // Ensure number
                documents: body.documents || {},
                status: "Pending"
            }
        });

        console.log("Booking created successfully:", booking.id);
        return NextResponse.json(booking, { status: 201 });
    } catch (error: any) {
        console.error("Error creating booking:", error);
        // Return actual error message for debugging
        return NextResponse.json(
            { error: "Failed to create booking", code: error.code, meta: error.meta, details: error.message },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        // Fetch all bookings (Admin view mostly)
        const bookings = await prisma.booking.findMany({
            include: {
                scooter: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 100 // Limit for safety
        });

        return NextResponse.json(bookings);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
    }
}

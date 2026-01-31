import { NextResponse } from "next/server";
import { prisma } from "@/backend/lib/db";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // TODO: Validate dates and availability

        const booking = await prisma.booking.create({
            data: {
                scooterId: body.scooterId,
                userId: body.userId || null, // Optional for now
                riderName: body.riderName,
                riderEmail: body.riderEmail,
                riderPhone: body.riderPhone,
                riderPassport: body.riderPassport,
                startDate: new Date(body.startDate),
                endDate: new Date(body.endDate),
                totalAmount: body.totalAmount,
                documents: body.documents || {},
                status: "Pending"
            }
        });

        return NextResponse.json(booking, { status: 201 });
    } catch (error) {
        console.error("Error creating booking:", error);
        return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
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

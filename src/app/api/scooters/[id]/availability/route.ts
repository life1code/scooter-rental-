import { NextResponse } from "next/server";
import { prisma } from "@/backend/lib/db";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        if (!startDate || !endDate) {
            return NextResponse.json(
                { error: "startDate and endDate are required" },
                { status: 400 }
            );
        }

        const scooterId = params.id;
        const requestedStart = new Date(startDate);
        const requestedEnd = new Date(endDate);

        // Find overlapping bookings
        const conflictingBookings = await prisma.booking.findMany({
            where: {
                scooterId: scooterId,
                status: {
                    in: ['Pending', 'Active']
                },
                OR: [
                    {
                        // Requested period starts during existing booking
                        AND: [
                            { startDate: { lte: requestedStart } },
                            { endDate: { gte: requestedStart } }
                        ]
                    },
                    {
                        // Requested period ends during existing booking
                        AND: [
                            { startDate: { lte: requestedEnd } },
                            { endDate: { gte: requestedEnd } }
                        ]
                    },
                    {
                        // Requested period completely contains existing booking
                        AND: [
                            { startDate: { gte: requestedStart } },
                            { endDate: { lte: requestedEnd } }
                        ]
                    }
                ]
            },
            select: {
                id: true,
                startDate: true,
                endDate: true,
                riderName: true,
                status: true
            }
        });

        return NextResponse.json({
            available: conflictingBookings.length === 0,
            conflictingBookings: conflictingBookings
        });
    } catch (error: any) {
        console.error("Error checking availability:", error);
        return NextResponse.json(
            { error: "Failed to check availability", details: error.message },
            { status: 500 }
        );
    }
}

export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/backend/lib/db";

export const dynamic = 'force-dynamic';

// Helper to generate short 5-character alphanumeric ID
function generateShortId() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude ambiguous chars like 0, O, 1, I, l
    let result = '';
    for (let i = 0; i < 5; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const session = await getServerSession(authOptions);

        console.log("Received booking request for scooter:", body.scooterId);

        // Map userId from session if available
        const userId = body.userId || (session?.user as any)?.id || null;

        // Validate required fields
        if (!body.scooterId || !body.riderName || !body.riderPhone || !body.riderPassport) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Check for date conflicts
        const requestedStart = new Date(body.startDate);
        const requestedEnd = new Date(body.endDate);

        const conflictingBookings = await prisma.booking.findMany({
            where: {
                scooterId: body.scooterId,
                status: {
                    in: ['Pending', 'Active']
                },
                OR: [
                    {
                        AND: [
                            { startDate: { lte: requestedStart } },
                            { endDate: { gte: requestedStart } }
                        ]
                    },
                    {
                        AND: [
                            { startDate: { lte: requestedEnd } },
                            { endDate: { gte: requestedEnd } }
                        ]
                    },
                    {
                        AND: [
                            { startDate: { gte: requestedStart } },
                            { endDate: { lte: requestedEnd } }
                        ]
                    }
                ]
            }
        });

        if (conflictingBookings.length > 0) {
            return NextResponse.json(
                {
                    error: "Scooter is not available for the selected dates",
                    code: "BOOKING_CONFLICT"
                },
                { status: 409 }
            );
        }

        let booking;
        let retries = 3;
        while (retries > 0) {
            try {
                booking = await prisma.booking.create({
                    data: {
                        id: generateShortId(),
                        scooterId: body.scooterId,
                        userId: userId,
                        riderName: body.riderName,
                        riderEmail: body.riderEmail,
                        riderPhone: body.riderPhone,
                        riderPassport: body.riderPassport,
                        startDate: new Date(body.startDate),
                        endDate: new Date(body.endDate),
                        totalAmount: Number(body.totalAmount),
                        documents: body.documents || {},
                        status: "Pending"
                    }
                });
                break;
            } catch (e: any) {
                if (e.code === 'P2002' && e.meta?.target?.includes('id')) {
                    retries--;
                    if (retries === 0) throw e;
                    continue;
                }
                throw e;
            }
        }

        return NextResponse.json(booking, { status: 201 });
    } catch (error: any) {
        console.error("Error creating booking:", error);
        return NextResponse.json(
            { error: "Failed to create booking", details: error.message },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const isAdmin = session.user.email === 'smilylife996cha@gmail.com';

        const bookings = await prisma.booking.findMany({
            where: isAdmin ? {} : { userId: userId },
            include: { scooter: true },
            orderBy: { createdAt: 'desc' },
            take: 100
        });

        return NextResponse.json(bookings);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
    }
}

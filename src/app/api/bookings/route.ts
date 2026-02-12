import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/backend/lib/db";
import { uploadAgreementPdf } from "@/backend/lib/s3-utils";

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
        let userId = body.userId || (session?.user as any)?.id || null;

        console.log("Determined userId:", userId);

        // Safety check: verify user exists if we have an ID
        if (userId) {
            try {
                const userExists = await prisma.user.findUnique({
                    where: { id: userId },
                    select: { id: true }
                });

                if (!userExists) {
                    console.warn(`⚠️ User ID ${userId} not found in database. Setting userId to null to avoid FK error.`);
                    userId = null;
                }
            } catch (dbError) {
                console.error("Error verifying user existence:", dbError);
                userId = null; // Better safe than failing the booking
            }
        }

        // Validate required fields
        if (!body.scooterId || !body.riderName || !body.riderPhone || !body.riderPassport) {
            console.error("Missing required fields. Body:", {
                scooterId: body.scooterId,
                riderName: !!body.riderName,
                riderPhone: !!body.riderPhone,
                riderPassport: !!body.riderPassport
            });
            return NextResponse.json({
                error: "Missing required fields",
                missingFields: {
                    scooterId: !body.scooterId,
                    riderName: !body.riderName,
                    riderPhone: !body.riderPhone,
                    riderPassport: !body.riderPassport
                }
            }, { status: 400 });
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
                    },
                    include: {
                        scooter: true
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

        // Generate PDF and send email notification
        try {
            const { generateAgreementBase64 } = await import('@/reportservice/pdf-service');

            // Fetch scooter details for the PDF
            const scooter = await prisma.scooter.findUnique({
                where: { id: body.scooterId }
            });

            // Prepare booking data for PDF
            const pdfData = {
                id: booking?.id,
                rider: body.riderName,
                bike: scooter?.name || 'Scooter',
                amount: `$${booking?.totalAmount ? Number(booking.totalAmount).toFixed(2) : body.totalAmount}`,
                date: new Date().toLocaleDateString(),
                bookingTime: new Date().toLocaleTimeString(),
                rentalPeriod: `${new Date(body.startDate).toLocaleDateString()} - ${new Date(body.endDate).toLocaleDateString()}`,
                pricePerDay: scooter?.pricePerDay || 25,
                details: {
                    passportNumber: body.riderPassport,
                    phone: body.riderPhone,
                    idFront: body.documents?.idFront,
                    idBack: body.documents?.idBack,
                    passportImg: body.documents?.passport,
                    signature: body.documents?.signature
                }
            };

            const agreementPdf = generateAgreementBase64(pdfData);

            // Upload PDF to S3
            try {
                const pdfUrl = await uploadAgreementPdf(agreementPdf, booking?.id || 'unknown');
                console.log(`📄 Agreement PDF uploaded to S3: ${pdfUrl}`);

                // Optionally update booking with PDF URL if schema supports it
                // await prisma.booking.update({ where: { id: booking.id }, data: { agreementUrl: pdfUrl } });
            } catch (s3Error) {
                console.error('Failed to upload PDF to S3:', s3Error);
            }

            // Send email with PDF attachment directly via library
            const { sendNotificationEmail } = await import('@/backend/lib/email');
            await sendNotificationEmail({
                type: 'booking',
                booking: {
                    id: booking?.id,
                    rider: body.riderName,
                    riderEmail: body.riderEmail,
                    bike: scooter?.name || 'Scooter',
                    amount: `$${body.totalAmount}`,
                    startDate: new Date(body.startDate).toLocaleDateString(),
                    agreementPdf: agreementPdf
                }
            });

            console.log(`📧 Booking confirmation email sent to ${body.riderEmail}`);
        } catch (emailError) {
            console.error('Failed to send booking email:', emailError);
            // Don't fail the booking if email fails
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
        const { searchParams } = new URL(request.url);
        const checkAvailability = searchParams.get('checkAvailability') === 'true';

        // 1. Availability Check (For Calendar Filter - Everyone)
        if (checkAvailability) {
            // Fetch active bookings (public data only)
            const publicBookings = await prisma.booking.findMany({
                where: {
                    status: {
                        notIn: ['Cancelled', 'Completed']
                    },
                    endDate: {
                        gte: new Date() // Only fetch future/active bookings
                    }
                },
                select: {
                    scooterId: true,
                    startDate: true,
                    endDate: true,
                    status: true
                }
            });

            // Fetch blocked dates
            const blockedDates = await prisma.blockedDate.findMany({
                where: {
                    date: {
                        gte: new Date()
                    }
                }
            });

            // Transform blocked dates to look like bookings for the frontend
            const formattedBlocked = blockedDates.map(b => ({
                scooterId: b.scooterId,
                startDate: b.date,
                endDate: b.date,
                status: 'Blocked'
            }));

            // Merge and return
            return NextResponse.json([...publicBookings, ...formattedBlocked]);
        }

        // 2. User/Admin Booking History (For "My Bookings" / Dashboard)
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            // Guest accessing "My Bookings" endpoint directly -> Return empty
            // (Guests rely on localStorage in frontend, this purely restricted API access)
            return NextResponse.json([]);
        }

        const userId = (session.user as any).id;
        const userRole = (session.user as any).role;
        const userEmail = session.user.email;

        let whereConfig = {};

        if (userRole === "superadmin") {
            // Super admins see everything
            whereConfig = {};
        } else if (userRole === "host") {
            // Hosts see bookings for their scooters
            whereConfig = {
                scooter: {
                    hostId: userId
                }
            };
        } else {
            // Regular users see their own bookings
            whereConfig = {
                OR: [
                    { userId: userId },
                    { riderEmail: userEmail || "" }
                ]
            };
        }

        const bookings = await prisma.booking.findMany({
            where: whereConfig,
            include: {
                scooter: {
                    include: {
                        host: {
                            select: {
                                institutionName: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 100
        });

        return NextResponse.json(bookings);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
    }
}

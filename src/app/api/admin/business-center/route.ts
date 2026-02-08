import { NextResponse } from "next/server";
import { prisma } from "@/backend/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "superadmin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch all host profiles with their related data
        const hostProfiles = await prisma.hostProfile.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        role: true
                    }
                },
                scooters: {
                    include: {
                        bookings: true
                    }
                }
            },
            orderBy: {
                institutionName: 'asc'
            }
        });

        // Map and aggregate data per host
        const businessData = (hostProfiles as any[]).map((profile: any) => {
            const fleet = profile.scooters || [];
            const allBookings = fleet.flatMap((s: any) => s.bookings || []);

            // Calculate unique customers (riders)
            const uniqueRiderEmails = new Set(allBookings.map((b: any) => b.riderEmail).filter(Boolean));

            // Calculate revenue
            const totalRevenue = allBookings.reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0);

            return {
                id: profile.id, // Profile ID
                userId: profile.userId,
                institutionName: profile.institutionName || profile.user.name || "Unnamed Shop",
                institutionAddress: profile.institutionAddress || "No address provided",
                email: profile.user.email,
                phoneNumber: profile.phoneNumber,
                approvalStatus: profile.approvalStatus,
                stats: {
                    scooterCount: fleet.length,
                    activeScooterCount: fleet.filter((s: any) => s.status === 'Available').length,
                    bookingCount: allBookings.length,
                    customerCount: uniqueRiderEmails.size,
                    totalRevenue: totalRevenue
                },
                fleet: fleet.map((s: any) => ({
                    id: s.id,
                    name: s.name,
                    status: s.status,
                    pricePerDay: s.pricePerDay,
                    bookingCount: s.bookings.length
                })),
                recentBookings: allBookings
                    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 5)
                    .map((b: any) => ({
                        id: b.id,
                        riderName: b.riderName,
                        amount: b.totalAmount,
                        date: b.createdAt,
                        status: b.status
                    }))
            };
        });

        return NextResponse.json(businessData);
    } catch (error) {
        console.error("Business Center API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

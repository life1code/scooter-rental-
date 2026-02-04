import { NextResponse } from "next/server";
import { prisma } from "@/backend/lib/db";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Fetch blocked dates
        const blockedDates = await prisma.blockedDate.findMany({
            where: { scooterId: id }
        });

        // Fetch existing bookings that are not cancelled
        const bookings = await prisma.booking.findMany({
            where: {
                scooterId: id,
                status: { not: "Cancelled" }
            },
            select: {
                startDate: true,
                endDate: true
            }
        });

        return NextResponse.json({
            blockedDates: blockedDates.map(b => b.date),
            bookings: bookings
        });
    } catch (error) {
        console.error("Error fetching schedule:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { dates, action } = await request.json(); // action: "block" | "unblock"

        if (action === "block") {
            // Bulk create blocked dates
            // Using createMany for Efficiency, but need to handle potential duplicates if skipping uniqueness check
            // Or just loop if it's a few dates
            const operations = dates.map((dateStr: string) => {
                const date = new Date(dateStr);
                date.setHours(0, 0, 0, 0);
                return prisma.blockedDate.upsert({
                    where: {
                        scooterId_date: {
                            scooterId: id,
                            date: date
                        }
                    },
                    update: {},
                    create: {
                        scooterId: id,
                        date: date
                    }
                });
            });

            await prisma.$transaction(operations);
        } else if (action === "unblock") {
            // Delete blocked dates
            const dateObjects = dates.map((d: string) => {
                const date = new Date(d);
                date.setHours(0, 0, 0, 0);
                return date;
            });

            await prisma.blockedDate.deleteMany({
                where: {
                    scooterId: id,
                    date: { in: dateObjects }
                }
            });
        }

        return NextResponse.json({ message: "Schedule updated successfully" });
    } catch (error) {
        console.error("Error updating schedule:", error);
        return NextResponse.json({ error: "Failed to update schedule" }, { status: 500 });
    }
}

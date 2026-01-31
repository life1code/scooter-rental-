import { NextResponse } from "next/server";
import { prisma } from "@/backend/lib/db";
import { format } from "date-fns";

export async function GET() {
    try {
        const reviews = await prisma.review.findMany({
            where: { approved: true },
            orderBy: { date: 'desc' }
        });

        // Format dates for display
        const formattedReviews = reviews.map(r => ({
            ...r,
            date: format(new Date(r.date), "MMM dd, yyyy")
        }));

        return NextResponse.json(formattedReviews);
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Basic validation
        if (!body.name || !body.content || !body.rating) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const newReview = await prisma.review.create({
            data: {
                name: body.name,
                location: body.location || "Earth",
                rating: body.rating,
                content: body.content,
                bike: body.bike || "General Rental",
                avatar: `https://i.pravatar.cc/150?u=${Math.random().toString(36).substring(7)}` // Random avatar
            }
        });

        return NextResponse.json(newReview, { status: 201 });
    } catch (error) {
        console.error("Error creating review:", error);
        return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
    }
}

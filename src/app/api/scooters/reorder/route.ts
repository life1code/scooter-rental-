import { NextResponse } from "next/server";
import { prisma } from "@/backend/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        const ADMIN_EMAILS = ['rydexpvtltd@gmail.com', 'smilylife996cha@gmail.com'];
        const isAdmin = session?.user?.email && ADMIN_EMAILS.includes(session.user.email);

        if (!isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { orders } = await request.json(); // Array of { id: string, order: number }

        if (!Array.isArray(orders)) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        // Use a transaction for bulk update
        await prisma.$transaction(
            orders.map((item) =>
                prisma.scooter.update({
                    where: { id: item.id },
                    data: { order: item.order }
                })
            )
        );

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error reordering scooters:", error);
        return NextResponse.json({ error: "Failed to reorder scooters", details: error.message }, { status: 500 });
    }
}

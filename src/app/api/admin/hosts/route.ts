import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/backend/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if ((session?.user as any)?.role !== "superadmin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const hosts = await prisma.user.findMany({
            where: { role: "host" },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(hosts);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch hosts" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if ((session?.user as any)?.role !== "superadmin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { hostId, status } = body;

        if (!hostId || !status) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const updatedHost = await prisma.user.update({
            where: { id: hostId },
            data: { approvalStatus: status }
        });

        return NextResponse.json(updatedHost);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update host status" }, { status: 500 });
    }
}

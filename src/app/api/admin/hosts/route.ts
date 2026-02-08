import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/backend/lib/db";
import { sendNotificationEmail } from "@/backend/lib/email";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if ((session?.user as any)?.role !== "superadmin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const hosts = await prisma.hostProfile.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        role: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Flatten for frontend compatibility
        const flattenedHosts = hosts.map(profile => ({
            id: profile.id, // Profile ID
            userId: profile.userId,
            email: profile.user.email,
            name: profile.user.name,
            institutionName: profile.institutionName,
            institutionAddress: profile.institutionAddress,
            nicNumber: profile.nicNumber,
            nicPhoto: profile.nicPhoto,
            phoneNumber: profile.phoneNumber,
            approvalStatus: profile.approvalStatus,
            createdAt: profile.createdAt
        }));

        return NextResponse.json(flattenedHosts);
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
        const { hostId, status } = body; // hostId is Profile ID

        if (!hostId || !status) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const updatedProfile = await prisma.hostProfile.update({
            where: { id: hostId },
            data: { approvalStatus: status },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        role: true
                    }
                }
            }
        });

        // Notify host about approval/rejection
        if (status === 'approved') {
            try {
                await sendNotificationEmail({
                    type: 'host_approval',
                    host: {
                        ...updatedProfile,
                        email: updatedProfile.user.email,
                        name: updatedProfile.user.name
                    }
                });
            } catch (emailErr) {
                console.error("Host approval notification failed:", emailErr);
            }
        } else if (status === 'rejected') {
            try {
                await sendNotificationEmail({
                    type: 'host_rejection',
                    host: {
                        ...updatedProfile,
                        email: updatedProfile.user.email,
                        name: updatedProfile.user.name
                    }
                });
            } catch (emailErr) {
                console.error("Host rejection notification failed:", emailErr);
            }
        }

        return NextResponse.json(updatedProfile);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update host status" }, { status: 500 });
    }
}

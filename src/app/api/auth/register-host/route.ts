import { NextResponse } from "next/server";
import { prisma } from "@/backend/lib/db";
import { uploadHostDocument } from "@/backend/lib/s3-utils";
import { sendNotificationEmail } from "@/backend/lib/email";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, name, institutionName, institutionAddress, nicNumber, nicPhoto, phoneNumber } = body;

        if (!email || !institutionName || !nicNumber || !nicPhoto) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Upload NIC photo to S3
        let nicPhotoUrl = nicPhoto;
        if (nicPhoto.startsWith("data:image")) {
            const fileName = `nic_${nicNumber}_${Date.now()}.jpg`;
            nicPhotoUrl = await uploadHostDocument(nicPhoto, fileName);
        }

        // Check if user already exists
        let user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                role: true,
                email: true,
                name: true,
                hostProfile: true
            }
        });

        if (user?.hostProfile) {
            return NextResponse.json({ error: "A host profile already exists for this email" }, { status: 400 });
        }

        if (!user) {
            // Create a new user if one doesn't exist
            user = await prisma.user.create({
                data: {
                    email,
                    name,
                    role: "host",
                },
                select: { id: true, role: true, email: true, name: true, hostProfile: true }
            });
        } else {
            // Update existing user role if they are just a 'user'
            if (user.role === "user") {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { role: "host" },
                    select: { id: true, role: true }
                });
            }
        }

        // Create the host profile linked to the user
        const newHostProfile = await prisma.hostProfile.create({
            data: {
                userId: user.id,
                institutionName,
                institutionAddress,
                nicNumber,
                nicPhoto: nicPhotoUrl,
                phoneNumber,
                approvalStatus: "pending"
            }
        });

        // Notify admins about new host registration
        try {
            await sendNotificationEmail({
                type: 'host_registration',
                host: {
                    ...newHostProfile,
                    email: user.email,
                    name: user.name
                }
            });
        } catch (emailErr) {
            console.error("Admin notification failed:", emailErr);
        }

        return NextResponse.json({
            message: "Host registration successful. Pending super admin approval.",
            host: {
                id: user.id,
                email: user.email,
                profileId: newHostProfile.id,
                status: newHostProfile.approvalStatus
            }
        }, { status: 201 });

    } catch (error: any) {
        console.error("Host registration failed:", error);
        return NextResponse.json({
            error: "Failed to register host",
            details: error.message
        }, { status: 500 });
    }
}

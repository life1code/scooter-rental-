import { NextResponse } from "next/server";
import { prisma } from "@/backend/lib/db";
import { uploadHostDocument } from "@/backend/lib/s3-utils";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, name, institutionName, institutionAddress, nicNumber, nicPhoto, phoneNumber } = body;

        if (!email || !institutionName || !nicNumber || !nicPhoto) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json({ error: "User already exists with this email" }, { status: 400 });
        }

        // Upload NIC photo to S3
        let nicPhotoUrl = nicPhoto;
        if (nicPhoto.startsWith("data:image")) {
            const fileName = `nic_${nicNumber}_${Date.now()}.jpg`;
            nicPhotoUrl = await uploadHostDocument(nicPhoto, fileName);
        }

        // Create the host user in pending state
        const newHost = await prisma.user.create({
            data: {
                email,
                name,
                role: "host",
                approvalStatus: "pending",
                institutionName,
                institutionAddress,
                nicNumber,
                nicPhoto: nicPhotoUrl,
                phoneNumber
            }
        });

        return NextResponse.json({
            message: "Host registration successful. Pending super admin approval.",
            host: {
                id: newHost.id,
                email: newHost.email,
                status: newHost.approvalStatus
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

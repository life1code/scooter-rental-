import { NextResponse } from "next/server";
import { sendNotificationEmail } from "@/backend/lib/email";

export async function POST(request: Request) {
    try {
        const { type, booking } = await request.json();
        const result = await sendNotificationEmail({ type, booking });
        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Email API Route Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

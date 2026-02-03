import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { type, booking } = await request.json();
        const RESEND_API_KEY = process.env.RESEND_API_KEY;

        if (!RESEND_API_KEY || RESEND_API_KEY === 're_123456789') {
            console.warn("RESEND_API_KEY not configured. Skipping real email.");
            return NextResponse.json({ success: true, message: "Simulated (API Key missing)" });
        }

        if (!booking.riderEmail) {
            return NextResponse.json({ error: "No rider email provided" }, { status: 400 });
        }

        let subject = "";
        let html = "";
        let attachments: any[] = [];

        if (type === 'booking') {
            subject = `Rental Agreement - Booking #${booking.id}`;
            html = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h1 style="color: #2dd4bf;">Booking Confirmed!</h1>
                    <p>Dear ${booking.rider},</p>
                    <p>Thank you for choosing <strong>Rydex Scooter Rentals</strong>. Your booking for the <strong>${booking.bike}</strong> has been successfully received.</p>
                    <div style="background: #f4f4f4; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <p><strong>Booking ID:</strong> ${booking.id}</p>
                        <p><strong>Pickup Date:</strong> ${booking.startDate || 'See details'}</p>
                        <p><strong>Total Amount:</strong> ${booking.amount}</p>
                    </div>
                    <p>We are currently reviewing your documents. You will receive another email once your booking is approved by the admin.</p>
                    <p>Please find your signed <strong>Rental Agreement</strong> attached to this email.</p>
                    <br/>
                    <p>Safe riding!</p>
                    <p>The Rydex Team</p>
                </div>
            `;

            // Add PDF attachment if provided
            if (booking.agreementPdf) {
                const base64Content = booking.agreementPdf.split(',')[1];
                attachments.push({
                    content: base64Content,
                    filename: `Agreement-${booking.id}.pdf`
                });
            }
        } else if (type === 'approval') {
            subject = `Booking Approved - Ready to Ride! #${booking.id}`;
            html = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h1 style="color: #2dd4bf;">Your Booking is Approved!</h1>
                    <p>Hi ${booking.rider},</p>
                    <p>Great news! Your rental request for the <strong>${booking.bike}</strong> has been approved.</p>
                    <p>You can now proceed to the shop to pick up your scooter.</p>
                    <div style="background: #e6fffa; border: 1px solid #b2f5ea; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <p><strong>Location:</strong> Main Office, Mirissa</p>
                        <p><strong>WhatsApp Support:</strong> ${booking.ownerWhatsapp || '+94 70 000 0000'}</p>
                    </div>
                    <p>Enjoy your trip!</p>
                    <p>The Rydex Team</p>
                </div>
            `;
        }

        // Send via Resend API
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`
            },
            body: JSON.stringify({
                from: 'Rydex <onboarding@resend.dev>', // Change to verified domain later
                to: [booking.riderEmail],
                subject: subject,
                html: html,
                attachments: attachments
            })
        });

        const data = await res.json();
        return NextResponse.json({ success: true, data });

    } catch (error: any) {
        console.error("Email API Route Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function sendNotificationEmail({ type, booking }: { type: 'booking' | 'approval' | 'admin_booking', booking: any }) {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const ADMIN_EMAILS = ['rydexpvtltd@gmail.com', 'smilylife996cha@gmail.com'];

    if (!RESEND_API_KEY || RESEND_API_KEY === 're_123456789') {
        console.warn("RESEND_API_KEY not configured. Skipping real email.");
        return { success: true, message: "Simulated (API Key missing)" };
    }

    let recipients: string[] = [];
    let subject = "";
    let html = "";
    let attachments: any[] = [];

    if (type === 'booking') {
        if (!booking.riderEmail) {
            throw new Error("No rider email provided");
        }
        recipients = [booking.riderEmail];
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
        if (!booking.riderEmail) {
            throw new Error("No rider email provided");
        }
        recipients = [booking.riderEmail];
        subject = `Booking Approved - Ready to Ride! #${booking.id}`;
        html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <h1 style="color: #2dd4bf;">Your Booking is Approved!</h1>
                <p>Hi ${booking.rider},</p>
                <p>Great news! Your rental request for the <strong>${booking.bike}</strong> has been approved.</p>
                <p>You can now proceed to the shop to pick up your scooter.</p>
                <div style="background: #e6fffa; border: 1px solid #b2f5ea; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <p><strong>WhatsApp Support:</strong> ${booking.ownerWhatsapp || '+94 70 000 0000'}</p>
                </div>
                <p>Enjoy your trip!</p>
                <p>The Rydex Team</p>
            </div>
        `;
    } else if (type === 'admin_booking') {
        recipients = ADMIN_EMAILS;
        subject = `NEW BOOKING REQUEST - #${booking.id} - ${booking.rider}`;
        html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 2px solid #2dd4bf; padding: 20px; border-radius: 15px;">
                <h1 style="color: #2dd4bf; margin-top: 0;">New Booking Received!</h1>
                <p>A new booking request has been submitted and needs your review.</p>
                <div style="background: #f4f4f4; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #555;">Booking Details</h3>
                    <p><strong>Booking ID:</strong> <span style="font-family: monospace; background: #ddd; padding: 2px 5px; border-radius: 4px;">${booking.id}</span></p>
                    <p><strong>Scooter:</strong> ${booking.bike}</p>
                    <p><strong>Rental Period:</strong> ${booking.startDate} to ${booking.endDate}</p>
                    <p><strong>Total Amount:</strong> <span style="color: #2dd4bf; font-weight: bold;">${booking.amount}</span></p>
                    
                    <h3 style="margin-top: 20px; color: #555;">Rider Information</h3>
                    <p><strong>Name:</strong> ${booking.rider}</p>
                    <p><strong>Email:</strong> ${booking.riderEmail || 'N/A'}</p>
                    <p><strong>Phone:</strong> ${booking.riderPhone}</p>
                    <p><strong>Passport/ID:</strong> ${booking.riderPassport}</p>
                </div>
                <p>You can view and approve this booking in the admin dashboard.</p>
                <div style="text-align: center; margin-top: 30px;">
                    <a href="https://ceylonrider.com/admin" style="background: #2dd4bf; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;">Go to Admin Dashboard</a>
                </div>
            </div>
        `;

        // Also attach the agreement to admin for easy reference
        if (booking.agreementPdf) {
            const base64Content = booking.agreementPdf.split(',')[1];
            attachments.push({
                content: base64Content,
                filename: `Agreement-${booking.id}-${booking.rider.replace(/\s+/g, '_')}.pdf`
            });
        }
    }

    if (recipients.length === 0) {
        console.warn("No recipients found for email notification.");
        return { success: false, error: "No recipients" };
    }

    // Send via Resend API
    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`
        },
        body: JSON.stringify({
            from: 'Rydex <info@ceylonrider.com>',
            to: recipients,
            subject: subject,
            html: html,
            attachments: attachments
        })
    });

    const data = await res.json();
    return { success: true, data };
}

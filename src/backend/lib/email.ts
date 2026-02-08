export async function sendNotificationEmail({ type, booking, host }: { type: 'booking' | 'approval' | 'host_registration' | 'host_approval' | 'host_rejection', booking?: any, host?: any }) {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (!RESEND_API_KEY || RESEND_API_KEY === 're_123456789') {
        console.warn("RESEND_API_KEY not configured. Skipping real email.");
        return { success: true, message: "Simulated (API Key missing)" };
    }

    const SUPER_ADMIN_EMAILS = ['rydexpvtltd@gmail.com', 'smilylife996cha@gmail.com'];
    let subject = "";
    let html = "";
    let attachments: any[] = [];
    let toEmails: string[] = [];

    if (type === 'booking') {
        if (!booking?.riderEmail) throw new Error("No rider email provided");
        toEmails = [booking.riderEmail];
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

        if (booking.agreementPdf) {
            const base64Content = booking.agreementPdf.split(',')[1];
            attachments.push({
                content: base64Content,
                filename: `Agreement-${booking.id}.pdf`
            });
        }
    } else if (type === 'approval') {
        if (!booking?.riderEmail) throw new Error("No rider email provided");
        toEmails = [booking.riderEmail];
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
    } else if (type === 'host_registration') {
        if (!host?.email) throw new Error("No host email provided");
        toEmails = SUPER_ADMIN_EMAILS;
        subject = `NEW HOST APPLICATION: ${host.institutionName}`;
        html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <h1 style="color: #2dd4bf;">New Host Application!</h1>
                <p>A new institution has applied to become a host on the Rydex platform.</p>
                <div style="background: #f4f4f4; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <p><strong>Institution:</strong> ${host.institutionName}</p>
                    <p><strong>Host Name:</strong> ${host.name}</p>
                    <p><strong>Email:</strong> ${host.email}</p>
                    <p><strong>NIC:</strong> ${host.nicNumber}</p>
                </div>
                <p>Please log in to the Super Admin dashboard to review and approve this application.</p>
                <br/>
                <a href="https://rydex.ceilao.com/admin" style="background: #2dd4bf; color: black; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Review Application</a>
            </div>
        `;
    } else if (type === 'host_approval') {
        if (!host?.email) throw new Error("No host email provided");
        toEmails = [host.email];
        subject = `Host Account Approved - Welcome to Rydex!`;
        html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <h1 style="color: #2dd4bf;">Welcome Aboard!</h1>
                <p>Hi ${host.name},</p>
                <p>Congratulations! Your host application for <strong>${host.institutionName}</strong> has been approved by our team.</p>
                <p>You can now log in to your Host Dashboard to start listing your scooters and managing rentals.</p>
                <div style="margin: 30px 0;">
                    <a href="https://rydex.ceilao.com/admin/login" style="background: #2dd4bf; color: black; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Go to Host Dashboard</a>
                </div>
                <p>If you have any questions, feel free to reply to this email.</p>
                <p>Let's grow together!</p>
                <p>The Rydex Team</p>
            </div>
        `;
    } else if (type === 'host_rejection') {
        if (!host?.email) throw new Error("No host email provided");
        toEmails = [host.email];
        subject = `Update on your Rydex Host Application`;
        html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <h1 style="color: #ef4444;">Application Update</h1>
                <p>Hi ${host.name},</p>
                <p>Thank you for your interest in becoming a host for <strong>${host.institutionName}</strong> on Rydex.</p>
                <p>After reviewing your application, we regret to inform you that we cannot approve your host account at this time.</p>
                <div style="background: #fff5f5; border: 1px solid #fed7d7; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <p>Common reasons for rejection include incomplete documentation or verification issues.</p>
                </div>
                <p>If you believe this was an error or would like to provide more information, please feel free to reach out to us by replying to this email.</p>
                <p>Best regards,</p>
                <p>The Rydex Team</p>
            </div>
        `;
    }

    // Prepare combined email list
    const emailsToSend = [];

    // Main notification (to rider or super admin or host)
    emailsToSend.push({
        from: 'Rydex <info@ceylonrider.com>',
        to: toEmails,
        subject: subject,
        html: html,
        attachments: attachments
    });

    // If it's a new booking, also notify admins (extra notification)
    if (type === 'booking') {
        emailsToSend.push({
            from: 'Rydex <info@ceylonrider.com>',
            to: SUPER_ADMIN_EMAILS[0],
            subject: `NEW BOOKING ALERT: ${booking.rider} - #${booking.id}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h1 style="color: #2dd4bf;">New Booking Received!</h1>
                    <p>A new booking has been made on the platform.</p>
                    <div style="background: #f4f4f4; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <p><strong>Booking ID:</strong> ${booking.id}</p>
                        <p><strong>Rider:</strong> ${booking.rider}</p>
                        <p><strong>Email:</strong> ${booking.riderEmail}</p>
                        <p><strong>Scooter:</strong> ${booking.bike}</p>
                        <p><strong>Pickup Date:</strong> ${booking.startDate || 'See details'}</p>
                        <p><strong>Total Amount:</strong> ${booking.amount}</p>
                    </div>
                    <p>Please log in to the admin dashboard to review and approve this booking.</p>
                    <br/>
                    <a href="https://rydex.ceilao.com/admin" style="background: #2dd4bf; color: black; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Dashboard</a>
                </div>
            `,
            attachments: attachments
        });
    }

    const results = await Promise.all(emailsToSend.map(email =>
        fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`
            },
            body: JSON.stringify(email)
        })
    ));

    const data = await Promise.all(results.map(r => r.json()));
    return { success: true, data };
}

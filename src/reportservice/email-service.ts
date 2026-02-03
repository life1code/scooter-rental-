/**
 * Handles real email notifications using Resend.
 * This service is intended to be called from server-side components or API routes.
 */

export const sendEmailNotification = async (type: 'booking' | 'approval', booking: any) => {
    try {
        const response = await fetch('/api/email/notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, booking })
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Email failed:', error);
            return false;
        }

        console.log(`📧 SUCCESS: ${type} email sent successfully via API`);
        return true;
    } catch (e) {
        console.error('Email service error:', e);
        return false;
    }
};

/**
 * Legacy simulator - kept for compatibility during transition
 */
export const simulateEmailNotification = (type: 'booking' | 'approval', booking: any) => {
    console.log(`[SIMULATOR] ${type} email for ${booking.id}`);
    // Real call
    sendEmailNotification(type, booking);
};

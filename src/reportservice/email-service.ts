/**
 * Handles real email notifications using Resend.
 * This service is intended to be called from server-side components or API routes.
 */

export const sendEmailNotification = async (type: 'booking' | 'approval' | 'host_registration' | 'host_approval', data: { booking?: any, host?: any }) => {
    try {
        const response = await fetch('/api/email/notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, ...data })
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
export const simulateEmailNotification = (type: 'booking' | 'approval' | 'host_registration' | 'host_approval', data: any) => {
    console.log(`[SIMULATOR] ${type} email for ${data.id || data.email}`);
    // Real call
    if (type === 'host_registration' || type === 'host_approval') {
        sendEmailNotification(type, { host: data });
    } else {
        sendEmailNotification(type, { booking: data });
    }
};

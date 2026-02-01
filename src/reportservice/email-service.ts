/**
 * Simulates sending email notifications for various system events.
 */
export const simulateEmailNotification = (type: 'booking' | 'approval', booking: any) => {
    if (type === 'booking') {
        console.log(`📧 EMAIL SENT: Your rental agreement for the ${booking.bike} has been sent to your email!\n\nBooking ID: ${booking.id}`);
        if (typeof window !== 'undefined') alert(`📧 EMAIL SENT: Your rental agreement for the ${booking.bike} has been sent to your email!`);
    } else if (type === 'approval') {
        console.log(`✅ SUCCESS: Approval email sent to ${booking?.rider || 'Customer'}!\n\nBooking Reference: ${booking.id}`);
        if (typeof window !== 'undefined') alert(`✅ SUCCESS: Approval email sent to ${booking?.rider || 'Customer'}!`);
    }
};

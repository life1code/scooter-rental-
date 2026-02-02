/**
 * Calculate rental price with discount based on number of days
 * - 7+ days: 5% discount
 * - 30+ days: 12% discount
 */
export function calculateRentalPrice(pricePerDay: number, numberOfDays: number): {
    subtotal: number;
    discount: number;
    discountAmount: number;
    total: number;
} {
    const subtotal = pricePerDay * numberOfDays;
    let discount = 0;

    if (numberOfDays >= 30) {
        discount = 12;
    } else if (numberOfDays >= 7) {
        discount = 5;
    }

    const discountAmount = subtotal * (discount / 100);
    const total = subtotal - discountAmount;

    return {
        subtotal,
        discount,
        discountAmount,
        total
    };
}

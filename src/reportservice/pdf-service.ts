import { jsPDF } from "jspdf";

/**
 * Generates a professional single-page PDF rental agreement.
 */
export const generateRentalAgreement = (booking: any) => {
    const doc = new jsPDF();

    // Styled Header with Dark Background
    doc.setFillColor(33, 33, 33); // Dark background common in premium designs
    doc.rect(0, 0, 210, 45, 'F');

    // Logo position: Left side
    try {
        // We use the absolute path or public URL
        // In jspdf, if running in browser, "/images/pdf-logo.png" works if hosted.
        doc.addImage("/images/pdf-logo.png", "PNG", 15, 7, 40, 30);
    } catch (e) {
        console.error("Logo failed to load:", e);
    }

    // Title & Booking ID (Right aligned as per image)
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    doc.text("RENTAL AGREEMENT", 195, 24, { align: "right" });

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Booking ID: ${booking.id}`, 195, 34, { align: "right" });

    doc.setTextColor(0, 0, 0); // Reset for content

    // Content Section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    let y = 52; // Push down slightly for cleaner separation

    const addCompactSection = (title: string, data: { [key: string]: string }) => {
        doc.setFont("helvetica", "bold");
        doc.text(title, 15, y);
        y += 5;
        doc.line(15, y - 4, 195, y - 4);
        doc.setFont("helvetica", "normal");

        Object.entries(data).forEach(([key, value]) => {
            doc.setFont("helvetica", "bold");
            doc.text(`${key}:`, 20, y);
            doc.setFont("helvetica", "normal");
            doc.text(`${value}`, 70, y); // Aligned values
            y += 6;
        });
        y += 2;
    };

    const amountDisplay = booking.discount && booking.discount > 0
        ? `${booking.amount} (${booking.discount}% discount applied)`
        : booking.amount;

    addCompactSection("BOOKING & RIDER INFO", {
        "Booking Date": booking.date || new Date().toLocaleDateString(),
        "Booking Time": booking.bookingTime || new Date().toLocaleTimeString(),
        "Rental Period": booking.rentalPeriod || "N/A",
        "Rider": booking.rider || "N/A",
        "Scooter": booking.bike || "N/A",
        "Price Per Day": booking.pricePerDay ? `$${booking.pricePerDay}.00` : "$25.00",
        "Total Amount": amountDisplay || "N/A",
        "Passport/IC": booking.details?.passport || "N/A",
        "Phone": booking.details?.phone || "N/A"
    });

    // Add ID Photos (Compact Row)
    doc.setFont("helvetica", "bold");
    doc.text("IDENTITY DOCUMENTS", 15, y);
    y += 5;

    const photoWidth = 58;
    const photoHeight = 38;
    let x = 15;

    const addIdThumbnail = (imgData: string, label: string) => {
        if (imgData) {
            try {
                doc.setFontSize(7);
                doc.text(label, x, y - 1);
                doc.addImage(imgData, 'JPEG', x, y, photoWidth, photoHeight);
                x += photoWidth + 4;
            } catch (e) {
                doc.text("[Image Error]", x, y + 5);
            }
        }
    };

    if (booking.details) {
        addIdThumbnail(booking.details.idFront, "LICENSE FRONT");
        addIdThumbnail(booking.details.idBack, "LICENSE BACK");
        addIdThumbnail(booking.details.passportImg, "PASSPORT");
    }
    y += photoHeight + 10;

    // Add Passport Security Notice
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("PASSPORT SECURITY DEPOSIT NOTICE", 15, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const noticeText = "The customer's passport will be collected as a security deposit and kept safely during the rental period. The passport will be returned to the customer upon the safe return of the scooter. In the event of any damage to the scooter at the time of return, the passport will be retained until the full compensation for the damage has been paid by the customer.";
    const splitNotice = doc.splitTextToSize(noticeText, 180);
    doc.text(splitNotice, 15, y);
    y += splitNotice.length * 4 + 8;

    // Add Signature
    if (booking.details?.signature) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("DIGITAL SIGNATURE", 15, y);
        y += 2;

        // Render signature image - auto-detect format or use PNG if base64 contains it
        const sigData = booking.details.signature;
        const format = sigData.includes('png') ? 'PNG' : 'JPEG';

        try {
            doc.addImage(sigData, format, 15, y, 60, 20);
        } catch (e) {
            console.error("PDF Signature Error:", e);
            doc.rect(15, y, 60, 20);
            doc.setFontSize(7);
            doc.text("[Signature Rendering Failed]", 20, y + 10);
        }
        y += 25;
    }

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text("This document is a legally binding rental agreement generated by Ride Scooter Rentals.", 105, 290, { align: "center" });

    doc.save(`Agreement-${booking.id}.pdf`);
};

"use client";

import { Navbar } from "@/frontend/components/Navbar";
import { compressImage, safeSaveToLocalStorage } from "@/backend/lib/image-utils";
import { simulateEmailNotification } from "@/reportservice/email-service";
import { SCOOTERS } from "@/backend/data/scooters";
import { ChevronLeft, CheckCircle, FileText, User, CreditCard, ShieldCheck, Camera, Upload, Phone, Map as MapIcon, Info, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@/frontend/components/ToastProvider";

export default function BookingConfirm() {
    const { id } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [scooter, setScooter] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [signatureData, setSignatureData] = useState<string | null>(null);
    const { data: session } = useSession();
    const { showToast } = useToast();

    // Auth-fill state
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");

    useEffect(() => {
        if (session?.user) {
            if (session.user.name) setFullName(session.user.name);
            if (session.user.email) setEmail(session.user.email);
        }
    }, [session]);

    // Date selection state
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [numberOfDays, setNumberOfDays] = useState<number>(0);
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [discount, setDiscount] = useState<number>(0);
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
    const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
    const [availabilityError, setAvailabilityError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        // Initialize dates from URL parameters
        const urlStartDate = searchParams.get('startDate');
        const urlEndDate = searchParams.get('endDate');
        if (urlStartDate) setStartDate(urlStartDate);
        if (urlEndDate) setEndDate(urlEndDate);

        async function fetchScooter() {
            try {
                const res = await fetch(`/api/scooters/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setScooter(data);
                } else {
                    const staticMatch = SCOOTERS.find(s => s.id === id);
                    if (staticMatch) setScooter(staticMatch);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        }

        fetchScooter();
    }, [id]);

    // Calculate price when dates change
    useEffect(() => {
        if (startDate && endDate && scooter) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

            if (days > 0) {
                setNumberOfDays(days);
                const pricePerDay = scooter.pricePerDay || 0;
                const subtotal = days * pricePerDay;

                // Calculate discount
                let discountPercent = 0;
                if (days >= 30) discountPercent = 12;
                else if (days >= 7) discountPercent = 5;

                const discountAmount = subtotal * (discountPercent / 100);
                const total = subtotal - discountAmount;

                setDiscount(discountPercent);
                setTotalPrice(total);
            } else {
                setNumberOfDays(0);
                setTotalPrice(0);
                setDiscount(0);
            }
        }
    }, [startDate, endDate, scooter]);

    // Check availability when dates change
    useEffect(() => {
        if (startDate && endDate && id) {
            const checkAvailability = async () => {
                const start = new Date(startDate);
                const end = new Date(endDate);
                if (end <= start) {
                    setIsAvailable(null);
                    return;
                }

                setIsCheckingAvailability(true);
                setAvailabilityError(null);
                try {
                    const res = await fetch(`/api/scooters/${id}/availability?startDate=${startDate}&endDate=${endDate}`);
                    const data = await res.json();
                    if (res.ok) {
                        setIsAvailable(data.available);
                        if (!data.available) {
                            setAvailabilityError("This scooter is already booked for the selected dates.");
                        }
                    } else {
                        setAvailabilityError(data.error || "Failed to check availability");
                        setIsAvailable(null);
                    }
                } catch (e) {
                    console.error(e);
                    setAvailabilityError("Connection error. Could not check availability.");
                    setIsAvailable(null);
                } finally {
                    setIsCheckingAvailability(false);
                }
            };
            const timer = setTimeout(checkAvailability, 500); // Debounce to allow user to finish selecting
            return () => clearTimeout(timer);
        }
    }, [startDate, endDate, id]);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [previews, setPreviews] = useState<{ [key: string]: string | null }>({
        licenseFront: null,
        licenseBack: null,
        passport: null
    });

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result as string;
                const compressed = await compressImage(base64, 600, 0.6); // Higher compression for identity docs
                setPreviews(prev => ({ ...prev, [key]: compressed }));
            };
            reader.readAsDataURL(file);
        }
    };

    if (!scooter) return <div>Scooter not found</div>;

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        setIsDrawing(true);
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.beginPath();
        const rect = canvas.getBoundingClientRect();
        const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
        const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;
        ctx.moveTo(x, y);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
        const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const endDrawing = async () => {
        setIsDrawing(false);
        const rawSignature = canvasRef.current?.toDataURL() || null;
        if (rawSignature) {
            const compressedSignature = await compressImage(rawSignature, 400, 0.5); // Signatures can be very small
            setSignatureData(compressedSignature);
        } else {
            setSignatureData(null);
        }
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setSignatureData(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!signatureData) {
            showToast("Please provide an online signature.", "error");
            return;
        }

        if (!previews.licenseFront || !previews.licenseBack || !previews.passport) {
            showToast("Please upload all required documents: License Front, License Back, and Passport.", "error");
            return;
        }

        // Get form data
        const formData = new FormData(e.target as HTMLFormElement);

        if (!startDate || !endDate) {
            showToast("Please select pickup and return dates.", "error");
            return;
        }

        if (numberOfDays <= 0) {
            showToast("Return date must be after pickup date.", "error");
            return;
        }

        if (isAvailable === false) {
            showToast("The scooter is not available for the selected dates. Please choose different dates.", "error");
            return;
        }

        // Prepare booking data for database
        const bookingData = {
            scooterId: scooter?.id,
            userId: (session?.user as any)?.id || null,
            riderName: fullName,
            riderEmail: email || null,
            riderPhone: formData.get('phone') as string,
            riderPassport: formData.get('passport') as string,
            startDate: new Date(startDate).toISOString(),
            endDate: new Date(endDate).toISOString(),
            totalAmount: totalPrice,
            documents: {
                idFront: previews.licenseFront,
                idBack: previews.licenseBack,
                passport: previews.passport,
                signature: signatureData
            }
        };

        try {
            console.log('Submitting booking with data:', bookingData);

            // Save to database via API
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData)
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API error:', errorData);
                throw new Error(`${errorData.error || 'Failed to create booking'} (Code: ${errorData.code || 'N/A'})`);
            }

            const savedBooking = await response.json();
            console.log('Booking saved successfully:', savedBooking);

            // Generate PDF base64 for email attachment
            const { generateAgreementBase64 } = await import("@/reportservice/pdf-service");
            const agreementBase64 = generateAgreementBase64({
                id: savedBooking.id,
                rider: bookingData.riderName,
                bike: scooter?.name || "Scooter",
                amount: `$${totalPrice.toFixed(2)}`,
                pricePerDay: scooter?.pricePerDay,
                details: bookingData.documents
            });

            // Simulate sending initial booking agreement
            simulateEmailNotification('booking', {
                id: savedBooking.id,
                rider: bookingData.riderName,
                riderEmail: bookingData.riderEmail,
                bike: scooter?.name || "Scooter",
                scooterId: scooter?.id,
                ownerName: scooter?.ownerName || "Ride Owner",
                ownerWhatsapp: scooter?.ownerWhatsapp || "+94700000000",
                scooterImage: scooter?.image,
                location: scooter?.location || "Unawatuna",
                date: format(new Date(), 'MMM dd, yyyy'),
                status: "Pending",
                amount: `$${totalPrice.toFixed(2)}`,
                pricePerDay: scooter?.pricePerDay || 25,
                agreementPdf: agreementBase64, // Pass the base64 to the email service
                details: {
                    passport: bookingData.riderPassport,
                    phone: bookingData.riderPhone,
                    idFront: previews.licenseFront,
                    idBack: previews.licenseBack,
                    passportImg: previews.passport,
                    signature: signatureData
                }
            });

            // Save to localStorage for "My Bookings" page
            try {
                const existingBookings = JSON.parse(localStorage.getItem("recent_bookings") || "[]");

                // Ensure the saved booking has the full scooter structure for the UI
                const bookingToSave = {
                    ...savedBooking,
                    // If for some reason the API didn't return the full scooter object, reconstruct it
                    scooter: savedBooking.scooter || {
                        id: scooter.id,
                        name: scooter.name,
                        image: scooter.image,
                        location: scooter.location,
                        pricePerDay: scooter.pricePerDay,
                        ownerName: scooter.ownerName,
                        ownerWhatsapp: scooter.ownerWhatsapp
                    }
                };

                const newBookings = [
                    bookingToSave,
                    ...existingBookings
                ].slice(0, 10); // Keep only last 10

                safeSaveToLocalStorage("recent_bookings", newBookings);
            } catch (storageError) {
                console.error("Failed to save to localStorage:", storageError);
            }

            setIsSubmitted(true);
            showToast("Booking request sent successfully!", "success");
        } catch (error: any) {
            console.error('Booking error:', error);
            showToast(`Failed to create booking: ${error.message || "Unknown error"}`, "error");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen grid place-items-center text-white/40">
                Loading booking details...
            </div>
        );
    }

    if (!scooter) {
        return (
            <div className="min-h-screen grid place-items-center text-white">
                Scooter not found
            </div>
        );
    }

    if (isSubmitted) {
        return (
            <main className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6 text-center">
                <div className="max-w-md space-y-6 animate-in zoom-in-95">
                    <div className="w-20 h-20 bg-[var(--primary)]/20 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="w-10 h-10 text-[var(--primary)]" />
                    </div>
                    <h1 className="text-3xl font-bold">Booking Requested!</h1>
                    <p className="text-white/60">
                        Your rental request for the <span className="text-white font-bold">{scooter.name}</span> has been sent. A copy of your **Rental Agreement** has been sent to your email.
                    </p>
                    <p className="text-white/40 text-sm">
                        The shop will contact you shortly via <span className="text-[var(--primary)] font-bold">WhatsApp</span> for final confirmation.
                    </p>
                    <div className="flex gap-4">
                        <button
                            onClick={() => router.push("/")}
                            className="btn-primary flex-1"
                        >
                            Back to Home
                        </button>
                        <button
                            onClick={() => router.push("/track")}
                            className="btn-secondary flex-1 flex items-center justify-center gap-2"
                        >
                            <MapIcon className="w-4 h-4" /> Track Location
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[var(--background)] pb-20">
            <Navbar />

            <div className="max-w-5xl mx-auto px-4 pt-8">
                <Link href={`/scooters/${id}`} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6">
                    <ChevronLeft className="w-5 h-5" />
                    <span>Back to Details</span>
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="glass-card p-6 md:p-8">
                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-6 h-6 text-[var(--primary)]" />
                                    <h2 className="text-2xl font-bold">Rental Agreement</h2>
                                </div>
                                <Link href="/policy" className="flex items-center gap-1.5 text-xs text-white/40 hover:text-[var(--primary)] transition-colors">
                                    <Info className="w-4 h-4" /> Police & Shop Notices
                                </Link>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8" noValidate>
                                {/* Personal Information */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-white/60 border-l-2 border-[var(--primary)] pl-3">Personal Details</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Full Name</label>
                                            <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 focus-within:border-[var(--primary)]/50 transition-colors">
                                                <User className="w-4 h-4 text-white/30" />
                                                <input
                                                    required
                                                    name="fullName"
                                                    type="text"
                                                    placeholder="John Doe"
                                                    value={fullName}
                                                    onChange={(e) => setFullName(e.target.value)}
                                                    className="bg-transparent border-none focus:outline-none w-full text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Email Address</label>
                                            <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 focus-within:border-[var(--primary)]/50 transition-colors">
                                                <FileText className="w-4 h-4 text-white/30" />
                                                <input
                                                    required
                                                    name="email"
                                                    type="email"
                                                    placeholder="john@example.com"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="bg-transparent border-none focus:outline-none w-full text-sm placeholder:text-white/10"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">WhatsApp Contact Number</label>
                                            <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 focus-within:border-[var(--primary)]/50 transition-colors">
                                                <Phone className="w-4 h-4 text-green-500" />
                                                <input required name="phone" type="tel" placeholder="+94 77 123 4567" className="bg-transparent border-none focus:outline-none w-full text-sm" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Passport / IC Number</label>
                                            <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 focus-within:border-[var(--primary)]/50 transition-colors">
                                                <CreditCard className="w-4 h-4 text-white/30" />
                                                <input required name="passport" type="text" placeholder="P00000000" className="bg-transparent border-none focus:outline-none w-full text-sm" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Rental Period */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-white/60 border-l-2 border-[var(--primary)] pl-3">Rental Period</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Pickup Date</label>
                                            <input
                                                required
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                                className="w-full bg-white/5 p-3 rounded-xl border border-white/5 focus:border-[var(--primary)]/50 transition-colors text-sm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Return Date</label>
                                            <input
                                                required
                                                type="date"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                min={startDate || new Date().toISOString().split('T')[0]}
                                                className="w-full bg-white/5 p-3 rounded-xl border border-white/5 focus:border-[var(--primary)]/50 transition-colors text-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Availability Check */}
                                    {startDate && endDate && (
                                        <div className="mt-2 text-left">
                                            {isCheckingAvailability ? (
                                                <p className="text-xs text-white/40 flex items-center gap-2 animate-pulse">
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                    Checking availability...
                                                </p>
                                            ) : isAvailable === true ? (
                                                <p className="text-xs text-green-500 flex items-center gap-2">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    Scooter is available for these dates
                                                </p>
                                            ) : isAvailable === false ? (
                                                <p className="text-xs text-red-400 flex items-center gap-2">
                                                    <AlertCircle className="w-3 h-3" />
                                                    {availabilityError}
                                                </p>
                                            ) : null}
                                        </div>
                                    )}

                                    {/* Price Summary */}
                                    {numberOfDays > 0 && (
                                        <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-xl p-6 space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-white/40 italic">Rental Duration:</span>
                                                <span className="font-bold px-3 py-1 bg-white/5 rounded-lg">{numberOfDays} {numberOfDays === 1 ? 'day' : 'days'}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-white/40 italic">Rate:</span>
                                                <span className="font-bold">${scooter?.pricePerDay}/day</span>
                                            </div>
                                            {discount > 0 && (
                                                <div className="flex flex-col gap-4 p-4 bg-green-500/10 border-2 border-green-500/30 rounded-2xl animate-in zoom-in-95">
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                                                                <CheckCircle2 className="w-5 h-5 text-black" />
                                                            </div>
                                                            <div>
                                                                <span className="text-xs font-black text-green-500 uppercase tracking-[0.2em]">Loyalty Discount Applied</span>
                                                                <p className="text-[10px] text-green-500/60 font-medium">You saved {(discount).toFixed(0)}% based on your rental duration</p>
                                                            </div>
                                                        </div>
                                                        <span className="text-xl font-black text-green-400 neon-text">-${((numberOfDays * (scooter?.pricePerDay || 0)) * (discount / 100)).toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center text-xl border-t border-white/10 pt-4 mt-2">
                                                <span className="font-black tracking-tight">Total Amount</span>
                                                <div className="text-right">
                                                    <span className="text-3xl font-black text-[var(--primary)] neon-text">${totalPrice.toFixed(2)}</span>
                                                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">Inclusive of all taxes</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Document Uploads */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-white/60 border-l-2 border-[var(--primary)] pl-3">Required Documents</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">License Front (Photo)</label>
                                            <div className="relative group cursor-pointer aspect-video bg-white/5 rounded-xl border-2 border-dashed border-white/10 hover:border-[var(--primary)]/50 flex flex-col items-center justify-center p-4 transition-all overflow-hidden">
                                                {previews.licenseFront ? (
                                                    <img src={previews.licenseFront} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
                                                ) : (
                                                    <>
                                                        <Camera className="w-8 h-8 text-white/20 group-hover:text-[var(--primary)]/50 mb-2" />
                                                        <span className="text-xs text-white/40 group-hover:text-white/60">Upload front of license</span>
                                                    </>
                                                )}
                                                <input name="licenseFront" type="file" required className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleFileChange(e, 'licenseFront')} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">License Back (Photo)</label>
                                            <div className="relative group cursor-pointer aspect-video bg-white/5 rounded-xl border-2 border-dashed border-white/10 hover:border-[var(--primary)]/50 flex flex-col items-center justify-center p-4 transition-all overflow-hidden">
                                                {previews.licenseBack ? (
                                                    <img src={previews.licenseBack} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
                                                ) : (
                                                    <>
                                                        <Upload className="w-8 h-8 text-white/20 group-hover:text-[var(--primary)]/50 mb-2" />
                                                        <span className="text-xs text-white/40 group-hover:text-white/60">Upload back of license</span>
                                                    </>
                                                )}
                                                <input name="licenseBack" type="file" required className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleFileChange(e, 'licenseBack')} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Passport (First Page / Info Page)</label>
                                        <div className="relative group cursor-pointer h-32 bg-white/5 rounded-xl border-2 border-dashed border-white/10 hover:border-[var(--primary)]/50 flex flex-col items-center justify-center p-4 transition-all overflow-hidden">
                                            {previews.passport ? (
                                                <img src={previews.passport} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
                                            ) : (
                                                <>
                                                    <Camera className="w-8 h-8 text-white/20 group-hover:text-[var(--primary)]/50 mb-2" />
                                                    <span className="text-xs text-white/40 group-hover:text-white/60">Upload passport photo</span>
                                                </>
                                            )}
                                            <input name="passportImg" type="file" required className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleFileChange(e, 'passport')} />
                                        </div>
                                    </div>
                                </div>

                                {/* Online Signature */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-sm font-bold uppercase tracking-widest text-white/60 border-l-2 border-[var(--primary)] pl-3">Digital Signature</h3>
                                        <button type="button" onClick={clearSignature} className="text-[10px] font-bold text-[var(--secondary)] hover:underline uppercase tracking-widest">Clear</button>
                                    </div>
                                    <div className="bg-white p-2 rounded-xl border border-white/10">
                                        <canvas
                                            ref={canvasRef}
                                            width={600}
                                            height={200}
                                            onMouseDown={startDrawing}
                                            onMouseMove={draw}
                                            onMouseUp={endDrawing}
                                            onMouseLeave={endDrawing}
                                            onTouchStart={startDrawing}
                                            onTouchMove={draw}
                                            onTouchEnd={endDrawing}
                                            className="w-full bg-white rounded-lg cursor-crosshair border border-gray-200"
                                            style={{ touchAction: 'none' }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-white/40 text-center italic">Sign in the box above using your finger or mouse</p>
                                </div>

                                <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/20">
                                    <h4 className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-2">Sri Lankan Police Notice</h4>
                                    <p className="text-[10px] text-white/60 leading-relaxed mb-4">
                                        Failure to hold a valid international or local driving permit may lead to immediate confiscation of the vehicle and a fine from the authorities.
                                    </p>
                                    <Link href="/policy" className="text-[10px] text-[var(--primary)] font-bold hover:underline uppercase tracking-widest">Read All Police & Shop Notices</Link>
                                </div>

                                <div className="flex items-start gap-3 p-4 glass-card border-[var(--primary)]/10">
                                    <input required id="agree" type="checkbox" className="mt-1 w-4 h-4 rounded border-white/10 bg-white/5 text-[var(--primary)] focus:ring-[var(--primary)]" />
                                    <label htmlFor="agree" className="text-sm text-white/80 leading-relaxed cursor-pointer">
                                        I confirm that all uploaded documents are authentic and I agree to the <strong>Ride Rental Terms and Conditions</strong>.
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isCheckingAvailability || isAvailable === false}
                                    className="w-full btn-primary !py-4 shadow-[0_0_30px_rgba(45,212,191,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isCheckingAvailability ? "Checking..." : isAvailable === false ? "Dates Unavailable" : "Confirm & Request Approval"}
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="glass-card p-6 sticky top-24">
                            <h3 className="font-bold mb-4">Reservation Summary</h3>
                            <div className="flex gap-4 mb-6">
                                <div className="w-20 h-20 rounded-xl overflow-hidden bg-[var(--muted)] border border-white/10">
                                    <img src={scooter.image} className="w-full h-full object-cover" alt="" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm">{scooter.name}</h4>
                                    <p className="text-[10px] text-white/40 uppercase font-bold">{scooter.type}</p>
                                    <p className="text-[10px] text-[var(--secondary)] mt-1 font-bold">★ {scooter.rating}</p>
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-white/5">
                                <div className="flex justify-between text-xs">
                                    <span className="text-white/40 italic">Pick-up Location</span>
                                    <span className="font-medium">Main Office, Mirissa</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold pt-4 border-t border-white/5 text-[var(--primary)]">
                                    <span>Rate</span>
                                    <span>${scooter.pricePerDay}/day</span>
                                </div>
                            </div>

                            <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/5">
                                <div className="flex items-center gap-3 mb-2">
                                    <MapIcon className="w-4 h-4 text-[var(--primary)]" />
                                    <span className="text-xs font-bold uppercase tracking-widest">GPS Tracking Active</span>
                                </div>
                                <p className="text-[10px] text-white/40">This scooter is equipped with a GPS tracker for your safety and security.</p>
                            </div>

                            {/* Owner Info Card - Only for Booking Request */}
                            <div className="mt-6 p-5 bg-[var(--primary)]/5 rounded-2xl border border-[var(--primary)]/20 animate-in fade-in slide-in-from-bottom-2">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--primary)] mb-4 flex items-center gap-2">
                                    <User className="w-3 h-3" /> Scooter Owner
                                </h4>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                                            <User className="w-4 h-4 text-white/40" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-white/40 font-bold uppercase">Name</p>
                                            <p className="text-sm font-bold">{scooter.ownerName || "Ride Owner"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                                            <Phone className="w-4 h-4 text-green-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-white/40 font-bold uppercase">WhatsApp</p>
                                            <p className="text-sm font-bold text-green-500">{scooter.ownerWhatsapp || "+94700000000"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                                            <MapIcon className="w-4 h-4 text-white/40" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-white/40 font-bold uppercase">Location</p>
                                            <p className="text-sm font-bold">{scooter.location || "Unawatuna"}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-white/5 flex items-start gap-2">
                                    <Info className="w-3 h-3 text-white/20 mt-0.5" />
                                    <p className="text-[9px] text-white/30 italic leading-snug">
                                        The owner will verify your booking request and contact you for coordination.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

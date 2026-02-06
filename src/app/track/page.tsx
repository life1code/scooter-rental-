"use client";

import { Navbar } from "@/frontend/components/Navbar";
import {
    MapPin, Navigation, ChevronLeft, Radio,
    ShieldCheck, User, Phone, Info, MessageSquare,
    Wrench, AlertTriangle, HelpCircle, Bike, CreditCard, X
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/backend/lib/utils";

const TROUBLESHOOT_GUIDES = {
    start: {
        title: "Scooter won't start?",
        steps: [
            "Ensure the side stand is fully retracted.",
            "Check if the engine kill switch (red button) is in the 'ON' position.",
            "Hold the brake lever firmly while pressing the start button.",
            "Verify the battery level (shown in your dashboard)."
        ],
        icon: <Wrench className="w-5 h-5 text-orange-500" />
    },
    gps: {
        title: "GPS signal lost?",
        steps: [
            "Move to an open area away from tall buildings or trees.",
            "Wait 30-60 seconds for the signal to recalibrate.",
            "Ensure your phone's location services are enabled.",
            "Refresh this page to update the position."
        ],
        icon: <Radio className="w-5 h-5 text-[var(--primary)]" />
    },
    emergency: {
        title: "REPORT EMERGENCY",
        steps: [
            "Your safety is our priority. If you are in immediate danger, call 119 (Police).",
            "Contact the owner immediately via the 'Chat with Owner' button.",
            "Our 24/7 support line is available at: +94 77 125 4XXX",
            "State your location: Near Coconut Tree Hill"
        ],
        icon: <AlertTriangle className="w-5 h-5 text-red-500" />
    }
};

function MyBookingsContent() {
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const bookingId = searchParams.get("id");
    const [bookings, setBookings] = useState<any[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [activeGuide, setActiveGuide] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCancelling, setIsCancelling] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    const booking = bookings[selectedIndex];

    const handleNotifyOwner = () => {
        if (!booking || !activeGuide) return;

        const message = `Hi ${booking.scooter?.ownerName || "Owner"}, I am ${booking.riderName} currently renting your ${booking.scooter?.name}. I am experiencing an issue: "${activeGuide.title}". Could you please assist me? My location is currently near ${booking.scooter?.location}.`;
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${(booking.scooter?.ownerWhatsapp || "+94700000000").replace('+', '')}?text=${encodedMessage}`;

        window.open(whatsappUrl, '_blank');
    };

    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [mapLoaded, setMapLoaded] = useState(false);

    // Dynamic import for Leaflet (client-side only)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setMapLoaded(true);
        }
    }, []);

    useEffect(() => {
        async function fetchBookings() {
            setIsLoading(true);
            try {
                // Priority 1: Fetch from API
                const apiRes = await fetch('/api/bookings');
                const apiBookings = apiRes.ok ? await apiRes.json() : [];

                // Priority 2: Local Storage
                const localBookings = JSON.parse(localStorage.getItem("recent_bookings") || "[]");

                // Use a Map for deduplication
                const mergedMap = new Map();

                // Add API bookings first - they are the absolute source of truth
                apiBookings.forEach((b: any) => mergedMap.set(b.id, b));

                // IF LOGGED IN: We ONLY trust the API. This cleans up deleted bookings.
                // IF GUEST (Not Logged In): We fallback to local storage for their pending booking.
                if (!session) {
                    localBookings.forEach((b: any) => {
                        if (!b.scooter && b.scooterImage) {
                            b.scooter = {
                                name: b.bike,
                                image: b.scooterImage,
                                location: b.location,
                                ownerName: b.ownerName,
                                ownerWhatsapp: b.ownerWhatsapp
                            };
                        }
                        if (!mergedMap.has(b.id)) {
                            mergedMap.set(b.id, b);
                        }
                    });
                }

                const finalBookings = Array.from(mergedMap.values()).sort((a: any, b: any) =>
                    new Date(b.createdAt || b.startDate || 0).getTime() - new Date(a.createdAt || a.startDate || 0).getTime()
                );

                setBookings(finalBookings);

                // Update localStorage to match the synchronized state ONLY if we got a successful API response
                // This "prunes" the browser cache of any deleted bookings.
                if (apiRes.ok && session) {
                    localStorage.setItem("recent_bookings", JSON.stringify(finalBookings.slice(0, 10)));
                }

                // Set initial selection based on URL ID
                if (bookingId) {
                    const index = finalBookings.findIndex(b => b.id === bookingId);
                    if (index !== -1) setSelectedIndex(index);
                }
            } catch (error) {
                console.error("Failed to fetch bookings:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchBookings();
    }, [bookingId, session]);

    const handleCancelBooking = async () => {
        if (!booking || isCancelling) return;

        setIsCancelling(true);
        try {
            const res = await fetch(`/api/bookings/${booking.id}/cancel`, {
                method: 'PATCH',
            });

            if (res.ok) {
                // Update local state
                const updatedBookings = bookings.map(b =>
                    b.id === booking.id ? { ...b, status: 'Cancelled' } : b
                );
                setBookings(updatedBookings);
                setShowCancelConfirm(false);

                // Update localStorage
                localStorage.setItem("recent_bookings", JSON.stringify(updatedBookings.slice(0, 10)));

                alert("Booking cancelled successfully.");
            } else {
                const data = await res.json();
                alert(data.error || "Failed to cancel booking");
            }
        } catch (error) {
            console.error("Cancellation error:", error);
            alert("An error occurred while cancelling your booking.");
        } finally {
            setIsCancelling(false);
        }
    };

    // Geolocation Tracking
    useEffect(() => {
        if (!booking || !('geolocation' in navigator)) return;

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ lat: latitude, lng: longitude });

                // Update backend
                fetch(`/api/bookings/${booking.id}/location`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ lat: latitude, lng: longitude })
                }).catch(err => console.error("Failed to update location to server:", err));
            },
            (error) => console.error("Geolocation error:", error),
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, [booking]);

    if (isLoading) {
        return (
            <main className="min-h-screen bg-[var(--background)]">
                <Navbar />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
                </div>
            </main>
        );
    }

    if (bookings.length === 0) {
        return (
            <main className="min-h-screen bg-[var(--background)]">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 pt-24 text-center space-y-6">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10">
                        <Bike className="w-10 h-10 text-white/20" />
                    </div>
                    <h1 className="text-3xl font-bold">No Active Bookings</h1>
                    <p className="text-white/40 max-w-md mx-auto">
                        You don't have any active rentals at the moment. Explore our fleet to start your next adventure!
                    </p>
                    <Link href="/" className="btn-primary inline-flex items-center gap-2 px-8">
                        Browse Scooters
                    </Link>
                </div>
            </main>
        );
    }

    // Map Component (rendered only on client)
    const MapDisplay = () => {
        if (!mapLoaded || !location) return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-white/5 space-y-4">
                <div className="w-10 h-10 border-t-2 border-b-2 border-[var(--primary)] rounded-full animate-spin"></div>
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Awaiting GPS Signal...</p>
            </div>
        );

        const { MapContainer, TileLayer, Marker, Popup, useMap } = require('react-leaflet');
        const L = require('leaflet');

        const ADMIN_EMAILS = ['rydexpvtltd@gmail.com', 'smilylife996cha@gmail.com'];
        const isAdmin = session?.user?.email && ADMIN_EMAILS.includes(session.user.email);

        const getIcon = (color: string) => L.icon({
            iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
        });

        const RecenterMap = ({ coords }: { coords: { lat: number; lng: number } }) => {
            const map = useMap();
            // Only recenter if we change selection or it's first render
            useEffect(() => {
                if (coords) map.setView([coords.lat, coords.lng], map.getZoom() || 15);
            }, [coords]);
            return null;
        };

        return (
            <div className="w-full h-full">
                <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                <style>{`
                    .leaflet-container { background: #0a0c0f !important; }
                    .leaflet-tile { filter: grayscale(1) invert(1) opacity(0.2); }
                `}</style>
                <MapContainer center={[location.lat, location.lng]} zoom={15} className="w-full h-full">
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                    {/* User's current device position */}
                    <Marker position={[location.lat, location.lng]} icon={getIcon('gold')}>
                        <Popup>Your current position</Popup>
                    </Marker>

                    {/* Fleet markers for Admins */}
                    {isAdmin && bookings
                        .filter(b => b.status === 'Active' && b.lastLat && b.lastLng)
                        .map(b => (
                            <Marker key={b.id} position={[b.lastLat, b.lastLng]} icon={getIcon('blue')}>
                                <Popup>
                                    <div className="text-black min-w-[120px]">
                                        <p className="font-bold border-b pb-1 mb-1">{b.riderName}</p>
                                        <p className="text-xs text-blue-600 font-bold uppercase">{b.scooter?.name}</p>
                                        <p className="text-[10px] text-gray-500 italic">Tracking Live</p>
                                    </div>
                                </Popup>
                            </Marker>
                        ))
                    }

                    <RecenterMap coords={location} />
                </MapContainer>
            </div>
        );
    };

    return (
        <main className="min-h-screen bg-[var(--background)] pb-20">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 pt-12 space-y-10">
                <div className="space-y-6">
                    <Link href="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-2">
                        <ChevronLeft className="w-4 h-4" />
                        <span>Back to Home</span>
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-2">
                            <h1 className="text-4xl font-bold tracking-tight">My <span className="text-[var(--primary)]">Bookings</span></h1>
                            <p className="text-white/40 text-sm">You have {bookings.length} active rental{bookings.length > 1 ? 's' : ''}</p>
                        </div>

                        <div className="flex items-center gap-2 bg-white/5 p-3 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
                            <div className="flex items-center gap-2 px-4 border-r border-white/10 shrink-0">
                                <Radio className="w-5 h-5 text-[var(--primary)] animate-pulse" />
                                <div>
                                    <p className="text-[10px] font-bold text-white/40 uppercase">Signal</p>
                                    <p className="text-sm font-bold">Excellent</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 pl-4 shrink-0">
                                <ShieldCheck className="w-5 h-5 text-[var(--primary)]" />
                                <div>
                                    <p className="text-[10px] font-bold text-white/40 uppercase">Security</p>
                                    <p className="text-sm font-bold">Safe</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Booking Selector - Multiple Bookings UI */}
                    {bookings.length > 1 && (
                        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                            {bookings.map((b, idx) => (
                                <button
                                    key={b.id}
                                    onClick={() => setSelectedIndex(idx)}
                                    className={cn(
                                        "flex items-center gap-4 p-4 rounded-2xl border transition-all shrink-0 min-w-[240px]",
                                        selectedIndex === idx
                                            ? "glass-card border-[var(--primary)]/50 bg-[var(--primary)]/10"
                                            : "glass-card border-white/5 hover:border-white/20"
                                    )}
                                >
                                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/5 shrink-0">
                                        <img src={b.scooter?.image || "/images/pcx.jpeg"} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-sm truncate">{b.scooter?.name}</p>
                                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">{b.id}</p>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <span className={cn(
                                                "w-1.5 h-1.5 rounded-full",
                                                b.status === 'Active' ? "bg-green-500" : "bg-orange-500"
                                            )}></span>
                                            <span className="text-[9px] text-white/60 font-medium uppercase tracking-widest">{b.status}</span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-[var(--primary)]/10 text-[var(--primary)] font-bold uppercase ring-1 ring-[var(--primary)]/20">
                            {booking.status}
                        </span>
                        <div className="text-white/40 text-sm italic flex flex-wrap items-center gap-2">
                            <span>ID: {booking.id}</span>
                            {booking.startDate && booking.endDate && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-white/20 hidden sm:block"></span>
                                    <span className="text-[var(--primary)]/60 font-medium">
                                        {new Date(booking.startDate).toLocaleDateString()} — {new Date(booking.endDate).toLocaleDateString()}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="glass-card p-6 md:p-8 space-y-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <User className="w-4 h-4 text-[var(--primary)]" />
                                    <h3 className="text-sm font-bold uppercase tracking-widest">Rider Information</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                            <User className="w-5 h-5 text-white/40" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-white/40 uppercase font-bold">Full Name</p>
                                            <p className="font-bold">{booking.riderName}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                                            <Phone className="w-5 h-5 text-green-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-white/40 uppercase font-bold">WhatsApp</p>
                                            <p className="font-bold">{booking.riderPhone}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                            <CreditCard className="w-5 h-5 text-white/40" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-white/40 uppercase font-bold">Passport / ID</p>
                                            <p className="font-bold">{booking.riderPassport}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-card p-6 md:p-8 space-y-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Bike className="w-4 h-4 text-[var(--primary)]" />
                                    <h3 className="text-sm font-bold uppercase tracking-widest">Scooter Details</h3>
                                </div>
                                <div className="flex gap-4 mb-4">
                                    <div className="w-24 h-24 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                                        <img src={booking.scooter?.image || "/images/pcx.jpeg"} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-xl">{booking.scooter?.name}</h4>
                                        <p className="text-sm text-white/40 mb-2">{booking.scooter?.location} Station</p>
                                        <p className="text-lg font-bold text-[var(--primary)]">${booking.scooter?.pricePerDay}<span className="text-[10px] text-white/40 ml-1">/ day</span></p>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="text-center md:text-left md:px-2">
                                        <p className="text-[10px] text-white/40 font-bold uppercase mb-1">Pickup Date</p>
                                        <p className="text-xs font-bold">{booking.startDate ? new Date(booking.startDate).toLocaleDateString() : 'N/A'}</p>
                                    </div>
                                    <div className="text-center md:text-left md:px-2 md:border-l border-white/5">
                                        <p className="text-[10px] text-white/40 font-bold uppercase mb-1">Return Date</p>
                                        <p className="text-xs font-bold">{booking.endDate ? new Date(booking.endDate).toLocaleDateString() : 'N/A'}</p>
                                    </div>
                                    <div className="text-center md:text-left md:px-2 md:border-l border-white/5">
                                        <p className="text-[10px] text-white/40 font-bold uppercase mb-1">Duration</p>
                                        <p className="text-xs font-bold">
                                            {(() => {
                                                if (!booking.startDate || !booking.endDate) return '1 day';
                                                const start = new Date(booking.startDate);
                                                const end = new Date(booking.endDate);
                                                const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                                                return days > 0 ? `${days} ${days === 1 ? 'day' : 'days'}` : '1 day';
                                            })()}
                                        </p>
                                    </div>
                                    <div className="text-center md:text-left md:px-2 md:border-l border-white/5">
                                        <p className="text-[10px] text-white/40 font-bold uppercase mb-1">Total Price</p>
                                        <p className="text-[13px] font-bold text-[var(--primary)]">${booking.totalAmount || (booking.scooter?.pricePerDay)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card relative overflow-hidden aspect-video border-[var(--primary)]/10">
                            <MapDisplay />
                            <div className="absolute top-4 left-4 z-[1000] bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2 pointer-events-none">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-[10px] font-bold uppercase tracking-widest">Live GPS Position</span>
                            </div>
                            <div className="absolute bottom-4 right-4 z-[1000] flex gap-2">
                                <button
                                    onClick={() => location && setLocation({ ...location })}
                                    className="bg-black/80 p-2 rounded-lg border border-white/10 hover:border-[var(--primary)] transition-colors"
                                >
                                    <Navigation className="w-4 h-4" />
                                </button>
                                <button className="bg-black/80 p-2 rounded-lg border border-white/10 hover:border-[var(--primary)] transition-colors font-bold text-[10px] px-3">RECENTER</button>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-8">
                        <div className="glass-card p-6 md:p-8 space-y-8 border-[var(--primary)]/20 shadow-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-[var(--primary)]/20 flex items-center justify-center border border-[var(--primary)]/30">
                                    <MessageSquare className="w-6 h-6 text-[var(--primary)]" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-white/40">Scooter Owner</h3>
                                    <p className="text-xl font-bold">{booking.scooter?.ownerName || "Ride Owner"}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <p className="text-xs text-white/40 leading-relaxed">
                                    If you need to coordinate the pickup or have any questions about the ride, contact the owner directly.
                                </p>
                                <button
                                    onClick={() => window.open(`https://wa.me/${(booking.scooter?.ownerWhatsapp || "").replace('+', '')}`, '_blank')}
                                    className="w-full bg-green-500 hover:bg-green-600 text-white !py-4 rounded-2xl flex items-center justify-center gap-3 transition-all font-bold shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                                >
                                    <Phone className="w-5 h-5" />
                                    <span>Chat with Owner</span>
                                </button>
                            </div>

                            {/* Cancel Booking Section */}
                            {(booking.status === 'Pending' || booking.status === 'Active') && (
                                <div className="pt-6 border-t border-white/5">
                                    <button
                                        onClick={() => setShowCancelConfirm(true)}
                                        className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 !py-4 rounded-2xl flex items-center justify-center gap-3 transition-all font-bold border border-red-500/20"
                                    >
                                        <X className="w-5 h-5" />
                                        <span>Cancel Booking</span>
                                    </button>
                                    <p className="text-[10px] text-white/30 text-center mt-3 font-medium uppercase tracking-widest">
                                        Free cancellation for pending bookings
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Confirmation Modal for Cancellation */}
                        {showCancelConfirm && (
                            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                                <div className="glass-card max-w-sm w-full p-8 space-y-6 relative border-red-500/20 shadow-2xl">
                                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto border border-red-500/20">
                                        <AlertTriangle className="w-8 h-8 text-red-500" />
                                    </div>

                                    <div className="text-center space-y-2">
                                        <h3 className="text-xl font-bold">Cancel Booking?</h3>
                                        <p className="text-sm text-white/60">
                                            Are you sure you want to cancel your booking for <span className="text-white font-bold">{booking.scooter?.name}</span>? This action cannot be undone.
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <button
                                            onClick={handleCancelBooking}
                                            disabled={isCancelling}
                                            className="w-full bg-red-500 hover:bg-red-600 text-white !py-4 rounded-2xl font-bold transition-all disabled:opacity-50"
                                        >
                                            {isCancelling ? "Cancelling..." : "Yes, Cancel Booking"}
                                        </button>
                                        <button
                                            onClick={() => setShowCancelConfirm(false)}
                                            disabled={isCancelling}
                                            className="w-full bg-white/5 hover:bg-white/10 text-white !py-4 rounded-2xl font-bold transition-all border border-white/10"
                                        >
                                            No, Keep it
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="glass-card p-6 md:p-8 space-y-6 border-orange-500/20 bg-orange-500/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                                    <Wrench className="w-5 h-5 text-orange-500" />
                                </div>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-orange-500">Troubleshooting</h3>
                            </div>

                            <div className="space-y-3">
                                {Object.entries(TROUBLESHOOT_GUIDES).map(([key, guide]) => (
                                    <button
                                        key={key}
                                        onClick={() => setActiveGuide(guide)}
                                        className="w-full p-4 rounded-xl bg-white/5 border border-white/5 text-left hover:bg-white/10 transition-all flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-3">
                                            {key === 'gps' ? <AlertTriangle className="w-4 h-4 text-white/20 group-hover:text-orange-500" /> : <HelpCircle className="w-4 h-4 text-white/20 group-hover:text-[var(--primary)]" />}
                                            <span className="text-xs font-bold">{guide.title}</span>
                                        </div>
                                        <ChevronLeft className="w-3 h-3 rotate-180 opacity-20" />
                                    </button>
                                ))}
                            </div>

                            {activeGuide && (
                                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[var(--background)]/80 backdrop-blur-sm animate-in fade-in">
                                    <div className="glass-card max-w-sm w-full p-8 space-y-6 relative border-[var(--primary)]/20 shadow-2xl animate-in zoom-in-95">
                                        <button
                                            onClick={() => setActiveGuide(null)}
                                            className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-full text-white/40"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>

                                        <div className="flex items-center gap-3">
                                            {activeGuide.icon}
                                            <h3 className="text-lg font-bold uppercase tracking-tight">{activeGuide.title}</h3>
                                        </div>

                                        <div className="space-y-4">
                                            {activeGuide.steps.map((step: string, i: number) => (
                                                <div key={i} className="flex gap-3">
                                                    <div className="w-5 h-5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                                        {i + 1}
                                                    </div>
                                                    <p className="text-sm text-white/70 leading-relaxed">{step}</p>
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            onClick={handleNotifyOwner}
                                            className="w-full bg-green-500 hover:bg-green-600 text-white !py-3 rounded-xl transition-all font-bold"
                                        >
                                            Notify Owner
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function MyBookingsPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen bg-[var(--background)]">
                <Navbar />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
                </div>
            </main>
        }>
            <MyBookingsContent />
        </Suspense>
    );
}

"use client";

import { Navbar } from "@/frontend/components/Navbar";
import {
    MapPin, Navigation, ChevronLeft, Battery, Radio,
    ShieldCheck, User, Phone, Info, MessageSquare,
    Wrench, AlertTriangle, HelpCircle, Bike, CreditCard
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

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

export default function MyBookingsPage() {
    const [booking, setBooking] = useState<any>(null);
    const [activeGuide, setActiveGuide] = useState<any>(null);

    const handleNotifyOwner = () => {
        if (!booking || !activeGuide) return;

        const message = `Hi ${booking.ownerName}, I am ${booking.rider} currently renting your ${booking.bike}. I am experiencing an issue: "${activeGuide.title}". Could you please assist me? My location is currently near ${booking.location}.`;
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${booking.ownerWhatsapp?.replace('+', '')}?text=${encodedMessage}`;

        window.open(whatsappUrl, '_blank');
    };

    useEffect(() => {
        const bookings = JSON.parse(localStorage.getItem("recent_bookings") || "[]");
        if (bookings.length > 0) {
            setBooking(bookings[0]); // Show the most recent one
        }
    }, []);

    if (!booking) {
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

    return (
        <main className="min-h-screen bg-[var(--background)] pb-20">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 pt-12 space-y-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <Link href="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-2">
                            <ChevronLeft className="w-4 h-4" />
                            <span>Back to Home</span>
                        </Link>
                        <h1 className="text-4xl font-bold tracking-tight">My <span className="text-[var(--primary)]">Booking</span></h1>
                        <div className="flex items-center gap-3">
                            <span className="px-2 py-0.5 rounded text-[10px] bg-[var(--primary)]/10 text-[var(--primary)] font-bold uppercase ring-1 ring-[var(--primary)]/20">
                                {booking.status}
                            </span>
                            <p className="text-white/40 text-sm italic">Booking ID: {booking.id}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-white/5 p-3 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
                        <div className="flex items-center gap-2 pr-4 border-r border-white/10 shrink-0">
                            <Battery className="w-5 h-5 text-green-500" />
                            <div>
                                <p className="text-[10px] font-bold text-white/40 uppercase">Battery</p>
                                <p className="text-sm font-bold text-green-500">87%</p>
                            </div>
                        </div>
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

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Details (8 cols) */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* 1. Rider & Scooter Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Rider Card */}
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
                                            <p className="font-bold">{booking.riderName || booking.rider}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                                            <Phone className="w-5 h-5 text-green-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-white/40 uppercase font-bold">WhatsApp</p>
                                            <p className="font-bold">{booking.riderPhone || booking.details?.phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                            <CreditCard className="w-5 h-5 text-white/40" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-white/40 uppercase font-bold">Passport / ID</p>
                                            <p className="font-bold">{booking.riderPassport || booking.details?.passport}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Scooter Card */}
                            <div className="glass-card p-6 md:p-8 space-y-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Bike className="w-4 h-4 text-[var(--primary)]" />
                                    <h3 className="text-sm font-bold uppercase tracking-widest">Scooter Details</h3>
                                </div>
                                <div className="flex gap-4 mb-4">
                                    <div className="w-24 h-24 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                                        <img src={booking.scooterImage || "/images/pcx.jpeg"} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-xl">{booking.bike}</h4>
                                        <p className="text-sm text-white/40 mb-2">{booking.location} Station</p>
                                        <p className="text-lg font-bold text-[var(--primary)]">${booking.pricePerDay}<span className="text-[10px] text-white/40 ml-1">/ day</span></p>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-white/5 flex justify-between">
                                    <div className="text-center px-4">
                                        <p className="text-[10px] text-white/40 font-bold uppercase">Pickup</p>
                                        <p className="text-xs font-bold">{booking.location}</p>
                                    </div>
                                    <div className="text-center px-4 border-x border-white/5">
                                        <p className="text-[10px] text-white/40 font-bold uppercase">Rate</p>
                                        <p className="text-xs font-bold">${booking.pricePerDay}/day</p>
                                    </div>
                                    <div className="text-center px-4">
                                        <p className="text-[10px] text-white/40 font-bold uppercase">Insurance</p>
                                        <p className="text-xs font-bold text-green-500">Active</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Map Visualization - Smaller now but still here */}
                        <div className="glass-card relative overflow-hidden aspect-video border-[var(--primary)]/10">
                            <div className="absolute inset-0 bg-[#1e2124]">
                                <div className="absolute inset-0 opacity-40 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/80.4578,5.9463,14,0/800x600?access_token=none')] bg-cover bg-center"></div>
                                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 600">
                                    <path d="M100,500 L200,450 L350,400 L500,300 L650,250" fill="none" stroke="var(--primary)" strokeWidth="4" strokeDasharray="8 4" className="animate-pulse" />
                                    <circle cx="650" cy="250" r="10" fill="var(--secondary)" className="animate-bounce" />
                                    <circle cx="650" cy="250" r="20" fill="var(--secondary)" className="animate-ping opacity-30" />
                                </svg>
                            </div>
                            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-[10px] font-bold uppercase tracking-widest">Live GPS Position</span>
                            </div>
                            <div className="absolute bottom-4 right-4 flex gap-2">
                                <button className="bg-black/80 p-2 rounded-lg border border-white/10 hover:border-[var(--primary)] transition-colors">
                                    <Navigation className="w-4 h-4" />
                                </button>
                                <button className="bg-black/80 p-2 rounded-lg border border-white/10 hover:border-[var(--primary)] transition-colors font-bold text-[10px]">RECENTER</button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Owner & Troubleshooting (4 cols) */}
                    <div className="lg:col-span-4 space-y-8">

                        {/* Owner Card */}
                        <div className="glass-card p-6 md:p-8 space-y-8 border-[var(--primary)]/20 shadow-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-[var(--primary)]/20 flex items-center justify-center border border-[var(--primary)]/30">
                                    <MessageSquare className="w-6 h-6 text-[var(--primary)]" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-white/40">Scooter Owner</h3>
                                    <p className="text-xl font-bold">{booking.ownerName || "Ride Owner"}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <p className="text-xs text-white/40 leading-relaxed">
                                    If you need to coordinate the pickup or have any questions about the ride, contact the owner directly.
                                </p>
                                <button
                                    onClick={() => window.open(`https://wa.me/${booking.ownerWhatsapp?.replace('+', '')}`, '_blank')}
                                    className="w-full bg-green-500 hover:bg-green-600 text-white !py-4 rounded-2xl flex items-center justify-center gap-3 transition-all font-bold shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                                >
                                    <Phone className="w-5 h-5" />
                                    <span>Chat with Owner</span>
                                </button>
                                <div className="flex justify-between items-center text-[10px] text-white/20 uppercase font-bold tracking-widest pt-2">
                                    <span>Typically Responds in</span>
                                    <span className="text-green-500/50">5 Minutes</span>
                                </div>
                            </div>
                        </div>

                        {/* Troubleshooting Box */}
                        <div className="glass-card p-6 md:p-8 space-y-6 border-orange-500/20 bg-orange-500/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                                    <Wrench className="w-5 h-5 text-orange-500" />
                                </div>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-orange-500">Troubleshooting</h3>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => setActiveGuide(TROUBLESHOOT_GUIDES.start)}
                                    className="w-full p-4 rounded-xl bg-white/5 border border-white/5 text-left hover:bg-white/10 transition-all flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-3">
                                        <HelpCircle className="w-4 h-4 text-white/20 group-hover:text-[var(--primary)]" />
                                        <span className="text-xs font-bold">Scooter won't start?</span>
                                    </div>
                                    <ChevronLeft className="w-3 h-3 rotate-180 opacity-20" />
                                </button>
                                <button
                                    onClick={() => setActiveGuide(TROUBLESHOOT_GUIDES.gps)}
                                    className="w-full p-4 rounded-xl bg-white/5 border border-white/5 text-left hover:bg-white/10 transition-all flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-3">
                                        <AlertTriangle className="w-4 h-4 text-white/20 group-hover:text-orange-500" />
                                        <span className="text-xs font-bold">GPS signal lost?</span>
                                    </div>
                                    <ChevronLeft className="w-3 h-3 rotate-180 opacity-20" />
                                </button>
                                <button
                                    onClick={() => setActiveGuide(TROUBLESHOOT_GUIDES.emergency)}
                                    className="w-full p-4 rounded-xl bg-orange-500/20 border border-orange-500/30 text-left hover:bg-orange-500/30 transition-all flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-3">
                                        <Info className="w-4 h-4 text-orange-500" />
                                        <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">Report Emergency</span>
                                    </div>
                                </button>
                            </div>

                            {/* Troubleshoot Modal/Overlay */}
                            {activeGuide && (
                                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[var(--background)]/80 backdrop-blur-sm animate-in fade-in">
                                    <div className="glass-card max-w-sm w-full p-8 space-y-6 relative border-[var(--primary)]/20 shadow-2xl animate-in zoom-in-95">
                                        <button
                                            onClick={() => setActiveGuide(null)}
                                            className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-full text-white/40"
                                        >
                                            <ChevronLeft className="w-5 h-5 rotate-90" />
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

                                        <div className="flex flex-col gap-3">
                                            <button
                                                onClick={handleNotifyOwner}
                                                className="w-full bg-green-500 hover:bg-green-600 text-white !py-3 rounded-xl flex items-center justify-center gap-2 transition-all font-bold shadow-[0_0_15px_rgba(34,197,94,0.2)]"
                                            >
                                                <MessageSquare className="w-4 h-4" />
                                                Notify Owner via WhatsApp
                                            </button>
                                            <button
                                                onClick={() => setActiveGuide(null)}
                                                className="w-full bg-white/5 hover:bg-white/10 text-white/60 !py-3 rounded-xl transition-all font-bold"
                                            >
                                                Got it, I'll try these steps
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <p className="text-[10px] text-white/20 text-center italic">
                                Support is available 24/7.
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </main>
    );
}

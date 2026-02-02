"use client";

import { Navbar } from "@/frontend/components/Navbar";
import { SCOOTERS } from "@/backend/data/scooters";
import { ChevronLeft, Star, Clock, Zap, Shield, Calendar as CalendarIcon, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";

export default function ScooterDetail() {
    const { id } = useParams();
    const router = useRouter();
    const [scooter, setScooter] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRange, setSelectedRange] = useState<any>();

    useEffect(() => {
        if (!id) return;

        async function fetchScooter() {
            try {
                // Try fetching from database first
                const res = await fetch(`/api/scooters/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setScooter(data);
                } else {
                    // Fallback to check local storage for custom ones NOT in DB (e.g. FLEET-XXXX)
                    const customScooters = JSON.parse(localStorage.getItem("custom_scooters") || "[]");
                    const customMatch = customScooters.find((s: any) => s.id === id);

                    if (customMatch) {
                        setScooter(customMatch);
                    } else {
                        // Last resort fallback to static array
                        const staticMatch = SCOOTERS.find(s => s.id === id);
                        if (staticMatch) setScooter(staticMatch);
                    }
                }
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        }

        fetchScooter();
    }, [id]);

    if (isLoading) return <div className="min-h-screen grid place-items-center text-white/40">Loading details...</div>;
    if (!scooter) return <div className="min-h-screen grid place-items-center text-white">Scooter not found</div>;

    return (
        <main className="min-h-screen bg-[var(--background)] pb-32">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 pt-8">
                <Link href="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6">
                    <ChevronLeft className="w-5 h-5" />
                    <span>Back to Browse</span>
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left Column: Image and Details */}
                    <div className="space-y-8">
                        <div className="glass-card overflow-hidden aspect-[4/3] relative">
                            <img src={scooter.image} alt={scooter.name} className="w-full h-full object-cover" />
                            <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-bold text-[var(--primary)] flex items-center gap-2">
                                <Zap className="w-3 h-3" />
                                Special Edition
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-4xl font-bold">{scooter.name}</h1>
                                    <p className="text-white/60 mt-2">{scooter.description}</p>
                                </div>
                                <div className="flex items-center gap-1 text-[var(--secondary)] font-bold text-lg">
                                    <Star className="w-4 h-4 fill-current" />
                                    {scooter.rating}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {Object.entries(scooter.specs).map(([key, value]) => (
                                    <div key={key} className="glass-card p-4 text-center">
                                        <p className="text-[10px] uppercase text-white/40 font-bold mb-1">{key}</p>
                                        <p className="font-bold text-sm">{String(value)}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-bold text-xl">Rental Features</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 text-white/80">
                                        <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
                                            <Shield className="w-4 h-4 text-[var(--primary)]" />
                                        </div>
                                        <span className="text-sm font-medium">Fully Insured</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-white/80">
                                        <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
                                            <Clock className="w-4 h-4 text-[var(--primary)]" />
                                        </div>
                                        <span className="text-sm font-medium">24/7 Roadside Assistance</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Booking */}
                    <div className="relative">
                        <div className="sticky top-24 glass-card p-6 md:p-8 space-y-8 border-[var(--primary)]/20 shadow-2xl">
                            <div className="flex items-baseline justify-between">
                                <div>
                                    <span className="text-3xl font-bold">${scooter.pricePerDay}</span>
                                    <span className="text-white/40 ml-1">/ day</span>
                                </div>
                                <div className="text-sm text-[var(--primary)] font-medium">Available Now</div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <CalendarIcon className="w-4 h-4 text-white/40" />
                                    <span className="text-sm font-bold uppercase tracking-wider text-white/40">Select Booking Dates</span>
                                </div>
                                <div className="flex justify-center bg-white/5 rounded-2xl p-4 border border-white/5">
                                    <DayPicker
                                        mode="range"
                                        selected={selectedRange}
                                        onSelect={setSelectedRange}
                                        styles={{
                                            caption: { color: 'white' },
                                            head_cell: { color: 'rgba(255,255,255,0.4)' },
                                            day: { color: 'white' },
                                            nav_button: { color: 'white' }
                                        }}
                                        modifiersStyles={{
                                            selected: { backgroundColor: 'var(--primary)', color: 'black' },
                                            today: { border: '2px solid var(--primary)' }
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                {selectedRange?.from && selectedRange?.to ? (() => {
                                    const diff = Math.abs(selectedRange.to.getTime() - selectedRange.from.getTime());
                                    const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
                                    return (
                                        <div className="p-4 rounded-xl bg-[var(--primary)]/5 border border-[var(--primary)]/20 text-sm">
                                            <p className="flex justify-between mb-2">
                                                <span className="text-white/60">Duration:</span>
                                                <span className="font-bold">{days} {days === 1 ? 'day' : 'days'}</span>
                                            </p>
                                            <p className="flex justify-between text-lg">
                                                <span className="text-white/60">Estimated Total:</span>
                                                <span className="font-bold neon-text">${scooter.pricePerDay * days}</span>
                                            </p>
                                        </div>
                                    );
                                })() : (
                                    <p className="text-sm text-white/40 text-center">Select your rental period to see pricing</p>
                                )}

                                <button
                                    onClick={() => {
                                        if (selectedRange?.from && selectedRange?.to) {
                                            const startDate = format(selectedRange.from, 'yyyy-MM-dd');
                                            const endDate = format(selectedRange.to, 'yyyy-MM-dd');
                                            router.push(`/scooters/${id}/confirm?startDate=${startDate}&endDate=${endDate}`);
                                        } else {
                                            router.push(`/scooters/${id}/confirm`);
                                        }
                                    }}
                                    disabled={!selectedRange?.from}
                                    className="w-full btn-primary flex items-center justify-center gap-2 py-4 disabled:opacity-50 disabled:hover:scale-100"
                                >
                                    <span>Request Booking</span>
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>

                            <p className="text-[10px] text-center text-white/20">
                                You won't be charged yet. The owner will review your request.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

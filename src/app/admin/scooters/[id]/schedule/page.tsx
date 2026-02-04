"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/frontend/components/Navbar";
import { ArrowLeft, Calendar as CalendarIcon, Save, Loader2, Lock, Unlock } from "lucide-react";
import Link from "next/link";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format, isSameDay } from "date-fns";
import { useSession } from "next-auth/react";

export default function ScheduleManagement() {
    const { id } = useParams();
    const router = useRouter();
    const { data: session, status } = useSession();

    const [scooter, setScooter] = useState<any>(null);
    const [blockedDates, setBlockedDates] = useState<Date[]>([]);
    const [bookedDates, setBookedDates] = useState<Date[]>([]);
    const [selectedDates, setSelectedDates] = useState<Date[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Auth check
    useEffect(() => {
        if (status === "loading") return;
        const ADMIN_EMAILS = ['rydexpvtltd@gmail.com', 'smilylife996cha@gmail.com'];
        const isGoogleAdmin = session?.user?.email && ADMIN_EMAILS.includes(session.user.email);

        if (status === "unauthenticated" || !isGoogleAdmin) {
            router.push("/admin/login");
        }
    }, [status, session, router]);

    useEffect(() => {
        if (!id || status !== "authenticated") return;

        async function fetchData() {
            try {
                // Fetch scooter details
                const scooterRes = await fetch(`/api/scooters/${id}`);
                if (scooterRes.ok) {
                    setScooter(await scooterRes.json());
                }

                // Fetch schedule
                const scheduleRes = await fetch(`/api/scooters/${id}/blocked-dates`);
                if (scheduleRes.ok) {
                    const data = await scheduleRes.json();
                    setBlockedDates(data.blockedDates.map((d: string) => new Date(d)));

                    // Flatten bookings to individual dates
                    const allBookedDates: Date[] = [];
                    data.bookings.forEach((b: any) => {
                        let current = new Date(b.startDate);
                        const end = new Date(b.endDate);
                        while (current <= end) {
                            allBookedDates.push(new Date(current));
                            current.setDate(current.getDate() + 1);
                        }
                    });
                    setBookedDates(allBookedDates);
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [id, status]);

    const handleSave = async (action: "block" | "unblock") => {
        if (selectedDates.length === 0) return;

        setIsSaving(true);
        try {
            const res = await fetch(`/api/scooters/${id}/blocked-dates`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    dates: selectedDates.map(d => format(d, 'yyyy-MM-dd')),
                    action
                })
            });

            if (res.ok) {
                // Refresh data
                const scheduleRes = await fetch(`/api/scooters/${id}/blocked-dates`);
                if (scheduleRes.ok) {
                    const data = await scheduleRes.json();
                    setBlockedDates(data.blockedDates.map((d: string) => new Date(d)));
                }
                setSelectedDates([]);
                alert(`Successfully ${action}ed selected dates.`);
            } else {
                alert("Failed to update schedule.");
            }
        } catch (error) {
            console.error("Error saving schedule:", error);
            alert("An error occurred while saving.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="min-h-screen grid place-items-center text-white/40">Loading schedule...</div>;
    if (!scooter) return <div className="min-h-screen grid place-items-center text-white">Scooter not found</div>;

    return (
        <main className="min-h-screen pb-20">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 pt-12">
                <Link href="/admin/fleet" className="inline-flex items-center gap-2 text-white/40 hover:text-[var(--primary)] transition-colors mb-8 group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-bold uppercase tracking-widest">Back to Fleet</span>
                </Link>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight">Manage <span className="text-[var(--primary)]">Schedule</span></h1>
                        <p className="text-white/40">Update availability for {scooter.name}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Calendar Section */}
                    <div className="lg:col-span-2 glass-card p-6 md:p-8">
                        <div className="flex justify-center bg-white/5 rounded-2xl p-4 border border-white/5">
                            <DayPicker
                                mode="multiple"
                                selected={selectedDates}
                                onSelect={(dates) => setSelectedDates(dates || [])}
                                modifiers={{
                                    blocked: blockedDates,
                                    booked: bookedDates
                                }}
                                modifiersStyles={{
                                    blocked: { backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', fontWeight: 'bold' },
                                    booked: { backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', fontWeight: 'bold' },
                                    selected: { backgroundColor: 'var(--primary)', color: 'black' }
                                }}
                                styles={{
                                    caption: { color: 'white' },
                                    head_cell: { color: 'rgba(255,255,255,0.4)' },
                                    day: { color: 'white' },
                                    nav_button: { color: 'white' }
                                }}
                            />
                        </div>

                        <div className="mt-8 flex flex-wrap gap-6 justify-center text-xs uppercase tracking-widest font-bold">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-blue-500/20 border border-blue-500/50"></div>
                                <span className="text-blue-400">Booked</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-red-500/20 border border-red-500/50"></div>
                                <span className="text-red-400">Blocked</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-[var(--primary)]"></div>
                                <span className="text-[var(--primary)]">Selected</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions Section */}
                    <div className="space-y-6">
                        <div className="glass-card p-6 space-y-6 border-[var(--primary)]/20 shadow-2xl">
                            <h3 className="text-xl font-bold">Manage Dates</h3>

                            {selectedDates.length > 0 ? (
                                <div className="space-y-4">
                                    <p className="text-sm text-white/60">
                                        You have selected <span className="text-white font-bold">{selectedDates.length}</span> days.
                                    </p>

                                    <div className="flex flex-col gap-3">
                                        <button
                                            onClick={() => handleSave("block")}
                                            disabled={isSaving}
                                            className="w-full btn-primary flex items-center justify-center gap-2 py-3 bg-red-500 hover:bg-red-600 border-red-500"
                                        >
                                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                                            Block Dates
                                        </button>

                                        <button
                                            onClick={() => handleSave("unblock")}
                                            disabled={isSaving}
                                            className="w-full btn-secondary flex items-center justify-center gap-2 py-3"
                                        >
                                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
                                            Unblock Dates
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-white/40 text-center py-8 border border-dashed border-white/10 rounded-xl">
                                    Select dates on the calendar to block or unblock them.
                                </p>
                            )}

                            <div className="pt-6 border-t border-white/10">
                                <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Quick Stats</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                        <p className="text-[10px] text-white/40 font-bold uppercase mb-1">Blocked</p>
                                        <p className="text-xl font-bold">{blockedDates.length}</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                        <p className="text-[10px] text-white/40 font-bold uppercase mb-1">Booked</p>
                                        <p className="text-xl font-bold">{bookedDates.length}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-6 bg-amber-500/5 border-amber-500/20">
                            <div className="flex gap-4">
                                <div className="shrink-0 w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-500">
                                    <CalendarIcon className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-amber-500">Pro Tip</h4>
                                    <p className="text-xs text-white/60 mt-1 leading-relaxed">
                                        Multi-select dates by clicking them individually. Blocked dates will be hidden from users on the booking page.
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

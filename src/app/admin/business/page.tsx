"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/frontend/components/Navbar";
import {
    ArrowLeft,
    Building2,
    Bike,
    Users,
    DollarSign,
    Search,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    MapPin,
    Phone,
    Mail,
    Clock,
    ShoppingBag
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/backend/lib/utils";

export default function BusinessCenter() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [shops, setShops] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedShop, setExpandedShop] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch('/api/admin/business-center');
                if (res.ok) {
                    const data = await res.json();
                    setShops(data);
                } else {
                    const errorData = await res.json();
                    if (res.status === 401) {
                        router.push("/admin/login");
                    }
                }
            } catch (error) {
                console.error("Failed to fetch business data:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [router]);

    const filteredShops = shops.filter(shop =>
        shop.institutionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalStats = shops.reduce((acc, shop) => ({
        stores: acc.stores + 1,
        scooters: acc.scooters + shop.stats.scooterCount,
        bookings: acc.bookings + shop.stats.bookingCount,
        revenue: acc.revenue + shop.stats.totalRevenue
    }), { stores: 0, scooters: 0, bookings: 0, revenue: 0 });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary)]"></div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[var(--background)] pb-20">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 pt-12">
                <Link href="/admin" className="inline-flex items-center gap-2 text-white/40 hover:text-[var(--primary)] transition-colors mb-8 group font-bold text-xs uppercase tracking-widest">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </Link>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight">
                            Business <span className="text-[var(--primary)]">Center</span>
                        </h1>
                        <p className="text-white/40 max-w-lg mt-2">
                            Global overview of all registered shops, their individual fleets, and customer activity.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard icon={<Building2 className="w-4 h-4" />} label="Total Stores" value={totalStats.stores} color="border-white/10" />
                        <StatCard icon={<Bike className="w-4 h-4" />} label="Total Fleet" value={totalStats.scooters} color="border-blue-500/20 text-blue-500" />
                        <StatCard icon={<ShoppingBag className="w-4 h-4" />} label="Total Bookings" value={totalStats.bookings} color="border-purple-500/20 text-purple-500" />
                        <StatCard icon={<DollarSign className="w-4 h-4" />} label="Global Revenue" value={`$${totalStats.revenue.toLocaleString()}`} color="border-[var(--primary)]/20 text-[var(--primary)]" />
                    </div>
                </div>

                <div className="relative mb-8">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input
                        type="text"
                        placeholder="Search by shop name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[var(--primary)] transition-all"
                    />
                </div>

                <div className="space-y-6">
                    {filteredShops.map((shop) => (
                        <div key={shop.id} className="glass-card border-white/5 overflow-hidden group">
                            <div
                                className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/[0.02] transition-colors"
                                onClick={() => setExpandedShop(expandedShop === shop.id ? null : shop.id)}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-[var(--primary)]/30 transition-colors">
                                        <Building2 className="w-7 h-7 text-white/40 group-hover:text-[var(--primary)] transition-colors" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-1">{shop.institutionName}</h3>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-white/40 text-[11px] font-medium uppercase tracking-wider">
                                            <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {shop.institutionAddress}</span>
                                            <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {shop.email}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8 md:gap-12">
                                    <div className="text-center">
                                        <p className="text-[10px] font-bold uppercase text-white/20 tracking-widest mb-1">Fleet</p>
                                        <p className="text-xl font-bold text-blue-500">{shop.stats.scooterCount}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-bold uppercase text-white/20 tracking-widest mb-1">Revenue</p>
                                        <p className="text-xl font-bold text-[var(--primary)]">${shop.stats.totalRevenue.toLocaleString()}</p>
                                    </div>
                                    <button className="p-2 rounded-xl bg-white/5 text-white/40 group-hover:text-white transition-colors">
                                        {expandedShop === shop.id ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                                    </button>
                                </div>
                            </div>

                            {expandedShop === shop.id && (
                                <div className="border-t border-white/5 p-8 bg-black/20 animate-in slide-in-from-top-4 duration-300">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                        {/* Fleet List */}
                                        <section>
                                            <div className="flex items-center justify-between mb-6">
                                                <h4 className="font-bold flex items-center gap-2">
                                                    <Bike className="w-4 h-4 text-blue-500" /> Current Fleet
                                                </h4>
                                                <Link href={`/admin/scooters?host=${shop.id}`} className="text-[10px] font-bold uppercase tracking-widest text-blue-500 hover:underline">View All</Link>
                                            </div>
                                            <div className="space-y-3">
                                                {shop.fleet.length > 0 ? shop.fleet.map((scooter: any) => (
                                                    <div key={scooter.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 text-[10px] font-bold">SM</div>
                                                            <span className="text-sm font-medium">{scooter.name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <span className="text-[10px] font-bold bg-green-500/10 text-green-500 px-2 py-0.5 rounded uppercase">{scooter.status}</span>
                                                            <span className="text-xs font-bold">${scooter.pricePerDay}/day</span>
                                                        </div>
                                                    </div>
                                                )) : (
                                                    <p className="text-sm text-white/20 italic">No scooters listed yet.</p>
                                                )}
                                            </div>
                                        </section>

                                        {/* Recent Activity */}
                                        <section>
                                            <div className="flex items-center justify-between mb-6">
                                                <h4 className="font-bold flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-purple-500" /> Recent Bookings
                                                </h4>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-purple-500">{shop.stats.bookingCount} Total</span>
                                            </div>
                                            <div className="space-y-3">
                                                {shop.recentBookings.length > 0 ? shop.recentBookings.map((booking: any) => (
                                                    <div key={booking.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                                        <div>
                                                            <p className="text-sm font-bold">{booking.riderName}</p>
                                                            <p className="text-[10px] text-white/40">{new Date(booking.date).toLocaleDateString()}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm font-bold text-[var(--primary)]">${booking.amount}</p>
                                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">{booking.status}</p>
                                                        </div>
                                                    </div>
                                                )) : (
                                                    <p className="text-sm text-white/20 italic">No bookings recorded yet.</p>
                                                )}
                                            </div>
                                        </section>
                                    </div>

                                    <div className="mt-8 pt-8 border-t border-white/5 flex justify-end">
                                        <Link
                                            href={`/admin?view=hosts&id=${shop.id}`}
                                            className="btn-secondary flex items-center gap-2 group/link"
                                        >
                                            View Full Shop Details
                                            <ExternalLink className="w-4 h-4 group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}

function StatCard({ icon, label, value, color }: { icon: any, label: string, value: string | number, color: string }) {
    return (
        <div className={cn("bg-white/5 border rounded-2xl p-4 flex flex-col items-center justify-center text-center", color)}>
            <div className="p-1.5 rounded-lg bg-white/5 mb-2">
                {icon}
            </div>
            <p className="text-[9px] font-bold uppercase tracking-tighter opacity-40 mb-1">{label}</p>
            <p className="text-lg font-bold tracking-tight">{value}</p>
        </div>
    );
}

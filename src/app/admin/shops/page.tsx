"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Navbar } from "@/frontend/components/Navbar";
import {
    Building2,
    Bike,
    Users,
    FileText,
    ArrowLeft,
    Search,
    Download,
    Calendar,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';

interface ShopData {
    hostId: string;
    name: string;
    scooterCount: number;
    activeRentals: number;
    totalRevenue: number;
    image?: string;
}

export default function ShopsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [scooters, setScooters] = useState<any[]>([]);
    const [bookings, setBookings] = useState<any[]>([]);
    const [shops, setShops] = useState<ShopData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedShop, setSelectedShop] = useState<ShopData | null>(null);
    const [activeTab, setActiveTab] = useState<'scooters' | 'bookings' | 'customers' | 'invoices'>('scooters');

    useEffect(() => {
        if (status === "loading") return;

        // Access Control
        const userRole = (session?.user as any)?.role;
        if (userRole !== 'superadmin') {
            router.push('/admin');
            return;
        }

        fetchData();
    }, [status, session, router]);

    const fetchData = async () => {
        try {
            const [scootersRes, bookingsRes] = await Promise.all([
                fetch('/api/scooters'),
                fetch('/api/bookings')
            ]);

            const scootersData = await scootersRes.json();
            const bookingsData = await bookingsRes.json();

            setScooters(scootersData);
            setBookings(bookingsData);
            processShops(scootersData, bookingsData);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            setLoading(false);
        }
    };

    const processShops = (scootersData: any[], bookingsData: any[]) => {
        const shopMap = new Map<string, ShopData>();

        scootersData.forEach(scooter => {
            const hostId = scooter.hostId;
            const hostName = scooter.host?.institutionName || scooter.host?.name || "Unknown Shop";

            if (!shopMap.has(hostId)) {
                shopMap.set(hostId, {
                    hostId,
                    name: hostName,
                    scooterCount: 0,
                    activeRentals: 0,
                    totalRevenue: 0,
                    image: scooter.host?.image
                });
            }

            const shop = shopMap.get(hostId)!;
            shop.scooterCount++;

            // Calculate revenue from active/completed bookings for this scooter
            const scooterRevenue = bookingsData
                .filter(b => b.scooterId === scooter.id)
                .reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);

            shop.totalRevenue += scooterRevenue;
        });

        // Calculate active rentals
        bookingsData.forEach(booking => {
            if (booking.status === 'Active' && booking.scooter?.hostId) {
                const shop = shopMap.get(booking.scooter.hostId);
                if (shop) shop.activeRentals++;
            }
        });

        setShops(Array.from(shopMap.values()));
    };

    if (loading) {
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

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    {selectedShop && (
                        <button
                            onClick={() => setSelectedShop(null)}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                    )}
                    <div>
                        <h1 className="text-3xl font-bold">
                            {selectedShop ? selectedShop.name : "Shops Management"}
                        </h1>
                        <p className="text-white/40">
                            {selectedShop
                                ? `Managing ${selectedShop.scooterCount} scooters and ${selectedShop.activeRentals} active rentals`
                                : "Overview of all partner shops and institutions"
                            }
                        </p>
                    </div>
                </div>

                {!selectedShop ? (
                    /* Shop List Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {shops.map(shop => (
                            <div
                                key={shop.hostId}
                                onClick={() => setSelectedShop(shop)}
                                className="glass-card p-6 border-white/5 hover:border-[var(--primary)]/50 cursor-pointer transition-all hover:scale-[1.01]"
                            >
                                <div className="flex items-start justify-between mb-6">
                                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                                        <Building2 className="w-6 h-6" />
                                    </div>
                                    <div className="bg-green-500/10 text-green-500 px-3 py-1 rounded-lg text-xs font-bold">
                                        ${shop.totalRevenue.toFixed(2)} Revenue
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold mb-1">{shop.name}</h3>
                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    <div className="bg-white/5 p-3 rounded-xl">
                                        <p className="text-[10px] text-white/40 uppercase font-bold">Fleet Size</p>
                                        <p className="text-xl font-bold mt-1">{shop.scooterCount}</p>
                                    </div>
                                    <div className="bg-white/5 p-3 rounded-xl">
                                        <p className="text-[10px] text-white/40 uppercase font-bold">Active</p>
                                        <p className="text-xl font-bold mt-1">{shop.activeRentals}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Selected Shop Details */
                    <div className="space-y-6">
                        {/* Tabs */}
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {[
                                { id: 'scooters', label: 'Scooters', icon: Bike },
                                { id: 'bookings', label: 'Bookings', icon: Calendar },
                                { id: 'customers', label: 'Customers', icon: Users },
                                { id: 'invoices', label: 'Invoices', icon: FileText },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`
                                        flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap
                                        ${activeTab === tab.id
                                            ? 'bg-[var(--primary)] text-black'
                                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                                        }
                                    `}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="glass-card p-6 border-white/5 min-h-[400px]">
                            {activeTab === 'scooters' && (
                                <div className="space-y-4">
                                    {scooters
                                        .filter(s => s.hostId === selectedShop.hostId)
                                        .map(scooter => (
                                            <div key={scooter.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                                                <div className="w-16 h-16 bg-black/40 rounded-lg overflow-hidden">
                                                    <img src={scooter.image} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold">{scooter.name}</h4>
                                                    <p className="text-sm text-white/40">{scooter.model} • {scooter.plateNumber}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${scooter.status === 'Available' ? 'bg-green-500/10 text-green-500' :
                                                            'bg-red-500/10 text-red-500'
                                                        }`}>
                                                        {scooter.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                            )}

                            {activeTab === 'bookings' && (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/10 text-white/40 text-xs uppercase">
                                            <th className="p-4">Reference</th>
                                            <th className="p-4">Rider</th>
                                            <th className="p-4">Scooter</th>
                                            <th className="p-4">Dates</th>
                                            <th className="p-4">Amount</th>
                                            <th className="p-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {bookings
                                            .filter(b => b.scooter?.hostId === selectedShop.hostId)
                                            .map(booking => (
                                                <tr key={booking.id} className="hover:bg-white/5">
                                                    <td className="p-4 font-mono text-sm">{booking.id.slice(0, 8)}</td>
                                                    <td className="p-4 text-sm font-bold">{booking.riderName}</td>
                                                    <td className="p-4 text-sm text-white/60">{booking.scooter?.name}</td>
                                                    <td className="p-4 text-xs text-white/40">
                                                        {new Date(booking.startDate).toLocaleDateString()} -
                                                        {new Date(booking.endDate).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-4 font-bold">${booking.totalAmount}</td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${booking.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-white/10'
                                                            }`}>
                                                            {booking.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </table>
                            )}

                            {activeTab === 'customers' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {Array.from(new Set(
                                        bookings
                                            .filter(b => b.scooter?.hostId === selectedShop.hostId)
                                            .map(b => b.riderName)
                                    )).map(riderName => {
                                        const lastBooking = bookings.find(b => b.riderName === riderName);
                                        return (
                                            <div key={riderName} className="p-4 bg-white/5 rounded-xl border border-white/5">
                                                <h4 className="font-bold">{riderName}</h4>
                                                <p className="text-sm text-white/40 mt-1">{lastBooking?.riderPhone}</p>
                                                <p className="text-xs text-white/40 mt-2">Passport: {lastBooking?.riderPassport}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {activeTab === 'invoices' && (
                                <div className="text-center py-12 text-white/40">
                                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>Select a booking to generate invoice from the Bookings tab,</p>
                                    <p>or use the dedicated Invoices page for bulk actions.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}

"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Navbar } from "@/frontend/components/Navbar";
import {
    FileText,
    Search,
    Download,
    Building2,
    Calendar,
    ArrowRight,
    ArrowLeft
} from 'lucide-react';
import { generateRentalAgreement, generateInvoice } from "@/reportservice/pdf-service";
import { useToast } from "@/frontend/components/ToastProvider";

interface ShopData {
    hostId: string;
    name: string;
    bookingCount: number;
    totalRevenue: number;
}

export default function InvoicesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { showToast } = useToast();

    const [bookings, setBookings] = useState<any[]>([]);
    const [shops, setShops] = useState<ShopData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedShop, setSelectedShop] = useState<ShopData | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

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
            const res = await fetch('/api/bookings');
            const bookingsData = await res.json();
            setBookings(bookingsData);
            processShops(bookingsData);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            setLoading(false);
        }
    };

    const processShops = (bookingsData: any[]) => {
        const shopMap = new Map<string, ShopData>();

        bookingsData.forEach(booking => {
            const hostId = booking.scooter?.hostId;
            if (!hostId) return;

            const hostName = booking.scooter?.host?.institutionName || booking.scooter?.host?.name || "Unknown Shop";

            if (!shopMap.has(hostId)) {
                shopMap.set(hostId, {
                    hostId,
                    name: hostName,
                    bookingCount: 0,
                    totalRevenue: 0
                });
            }

            const shop = shopMap.get(hostId)!;
            shop.bookingCount++;
            shop.totalRevenue += (Number(booking.totalAmount) || 0);
        });

        const shopList = Array.from(shopMap.values()).sort((a, b) => b.totalRevenue - a.totalRevenue);
        setShops(shopList);
        if (shopList.length > 0) setSelectedShop(shopList[0]);
    };

    const handleDownloadInvoice = (booking: any) => {
        try {
            const start = new Date(booking.startDate);
            const end = new Date(booking.endDate);
            const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

            // Calculate discount logic (mirroring admin page logic)
            let discount = 0;
            if (days >= 30) discount = 12;
            else if (days >= 7) discount = 5;

            generateInvoice({
                invoiceNumber: booking.id.slice(0, 8).toUpperCase(),
                date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                shopName: booking.scooter?.host?.institutionName || booking.scooter?.host?.name || "Ride Scooter Rentals",
                shopAddress: "Unawatuna, Sri Lanka", // Could be dynamic if address exists in host data
                period: `${new Date(booking.startDate).toLocaleDateString()} - ${new Date(booking.endDate).toLocaleDateString()}`,
                amount: `$${booking.totalAmount}`,
                scooterName: booking.scooter?.name,
                paymentDate: new Date(booking.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
            });
            showToast("Invoice downloaded successfully", "success");
        } catch (error) {
            console.error("Error generating invoice:", error);
            showToast("Failed to generate invoice", "error");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary)]"></div>
            </div>
        );
    }

    const filteredShops = shops.filter(shop =>
        shop.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const shopBookings = selectedShop
        ? bookings.filter(b => b.scooter?.hostId === selectedShop.hostId)
        : [];

    return (
        <main className="min-h-screen bg-[var(--background)] pb-20">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 pt-12">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.push('/admin')}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="p-3 bg-pink-500/10 rounded-xl text-pink-500">
                        <FileText className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Invoices Management</h1>
                        <p className="text-white/40">Manage and download rental agreements for all shops</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar - Shop List */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-center gap-2">
                            <Search className="w-4 h-4 text-white/40" />
                            <input
                                type="text"
                                placeholder="Search shops..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-transparent border-none text-sm focus:outline-none w-full text-white"
                            />
                        </div>
                        <div className="space-y-2 h-[600px] overflow-y-auto custom-scrollbar pr-2">
                            {filteredShops.map(shop => (
                                <button
                                    key={shop.hostId}
                                    onClick={() => setSelectedShop(shop)}
                                    className={`w-full text-left p-4 rounded-xl transition-all border ${selectedShop?.hostId === shop.hostId
                                        ? 'bg-[var(--primary)]/10 border-[var(--primary)]/50'
                                        : 'bg-white/5 border-transparent hover:bg-white/10'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className={`font-bold truncate ${selectedShop?.hostId === shop.hostId ? 'text-[var(--primary)]' : ''}`}>
                                            {shop.name}
                                        </h3>
                                        <ArrowRight className={`w-4 h-4 ${selectedShop?.hostId === shop.hostId ? 'text-[var(--primary)]' : 'text-white/20'}`} />
                                    </div>
                                    <div className="flex justify-between text-xs text-white/40">
                                        <span>{shop.bookingCount} Rentals</span>
                                        <span>${shop.totalRevenue.toFixed(2)}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Content - Bookings Table */}
                    <div className="lg:col-span-3">
                        {selectedShop ? (
                            <div className="glass-card border-white/5 overflow-hidden">
                                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                                    <div>
                                        <h2 className="text-xl font-bold">{selectedShop.name}</h2>
                                        <p className="text-sm text-white/40">Showing {shopBookings.length} rental records</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-white/40 uppercase">Total Revenue</p>
                                        <p className="text-xl font-bold text-green-500">${selectedShop.totalRevenue.toFixed(2)}</p>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-white/5 border-b border-white/10 text-white/40 text-[10px] uppercase font-bold tracking-wider">
                                                <th className="p-4">Reference</th>
                                                <th className="p-4">Rider</th>
                                                <th className="p-4">Scooter</th>
                                                <th className="p-4">Dates</th>
                                                <th className="p-4">Amount</th>
                                                <th className="p-4 text-center">Invoice</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {shopBookings.map(booking => (
                                                <tr key={booking.id} className="hover:bg-white/[0.02]">
                                                    <td className="p-4 font-mono text-sm">{booking.id.slice(0, 8)}</td>
                                                    <td className="p-4 text-sm font-bold">{booking.riderName}</td>
                                                    <td className="p-4 text-sm text-white/60">{booking.scooter?.name}</td>
                                                    <td className="p-4 text-xs text-white/40">
                                                        {new Date(booking.startDate).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-4 font-bold text-sm">${booking.totalAmount}</td>
                                                    <td className="p-4 text-center">
                                                        <button
                                                            onClick={() => handleDownloadInvoice(booking)}
                                                            className="p-2 hover:bg-[var(--primary)]/10 rounded-lg text-[var(--primary)] transition-colors inline-flex items-center gap-1 text-xs font-bold"
                                                            title="Download Invoice"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                            Download
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-white/40 py-20">
                                <Building2 className="w-16 h-16 mb-4 opacity-20" />
                                <p>Select a shop from the list to view invoices</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}

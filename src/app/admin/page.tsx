"use client";

import { Navbar } from "@/frontend/components/Navbar";
import { SCOOTERS } from "@/backend/data/scooters";
import {
    LayoutDashboard,
    Bike,
    Users,
    Settings,
    Plus,
    MoreVertical,
    TrendingUp,
    DollarSign,
    Clock,
    CheckCircle2,
    XCircle,
    Eye,
    FileText,
    ShieldCheck,
    ExternalLink,
    X,
    Download,
    Navigation
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { generateRentalAgreement } from "@/reportservice/pdf-service";
import { simulateEmailNotification } from "@/reportservice/email-service";

interface Booking {
    id: string;
    rider: string;
    bike: string;
    date: string;
    status: string;
    amount: string;
}

const TrackingMap = ({ activeBookings }: { activeBookings: any[] }) => {
    const [mapLoaded, setMapLoaded] = useState(false);

    useEffect(() => {
        setMapLoaded(true);
    }, []);

    if (!mapLoaded) return (
        <div className="w-full h-[400px] flex items-center justify-center bg-white/5 rounded-2xl border border-white/10">
            <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    const { MapContainer, TileLayer, Marker, Popup } = require('react-leaflet');
    const L = require('leaflet');

    const icon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41]
    });

    const activeWithGPS = activeBookings.filter(b => b.lastLat && b.lastLng);

    return (
        <div className="w-full h-[400px] rounded-2xl overflow-hidden border border-white/10 relative z-10">
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
            <style>{`
                .leaflet-container { background: #0a0c0f !important; }
                .leaflet-tile { filter: grayscale(1) invert(1) opacity(0.2); }
            `}</style>
            <MapContainer center={[6.0022, 80.2484]} zoom={13} className="w-full h-full">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {activeWithGPS.map((booking) => (
                    <Marker key={booking.id} position={[booking.lastLat, booking.lastLng]} icon={icon}>
                        <Popup>
                            <div className="text-black">
                                <p className="font-bold">{booking.riderName}</p>
                                <p className="text-xs">{booking.scooter?.name}</p>
                                <p className="text-[10px] uppercase font-bold text-blue-600">{booking.status}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [bookings, setBookings] = useState<any[]>([]);
    const [stats, setStats] = useState<any[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

    useEffect(() => {
        const isLocalAdmin = localStorage.getItem("is_host_admin") === "true";
        const isGoogleAdmin = status === "authenticated" && session?.user?.email === "smilylife996cha@gmail.com";

        if (status !== "loading" && !isLocalAdmin && !isGoogleAdmin) {
            router.push("/admin/login");
        }
    }, [status, session, router]);

    const fetchBookings = async () => {
        try {
            const res = await fetch('/api/bookings');
            if (res.ok) {
                const dbBookings = await res.json();
                setBookings(dbBookings);
            }
        } catch (error) {
            console.error("Failed to fetch bookings:", error);
        }
    };

    useEffect(() => {
        fetchBookings();
        const interval = setInterval(fetchBookings, 10000); // Poll every 10s for GPS updates
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const activeCount = bookings.filter(b => b.status === "Active").length;
        const pendingCount = bookings.filter(b => b.status === "Pending").length;
        const totalRevenue = bookings.reduce((acc, b) => acc + (b.totalAmount || 0), 0);

        setStats([
            { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10" },
            { label: "Active Rentals", value: activeCount, icon: Bike, color: "text-[var(--primary)]", bg: "bg-[var(--primary)]/10" },
            { label: "Pending Requests", value: pendingCount, icon: Clock, color: "text-[var(--secondary)]", bg: "bg-[var(--secondary)]/10" },
            { label: "Total Bookings", value: bookings.length, icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
        ]);
    }, [bookings]);

    const handleAction = async (id: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/bookings/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                fetchBookings();
            }
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    };

    return (
        <main className="min-h-screen bg-[var(--background)] pb-20">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 pt-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight">Host <span className="text-[var(--primary)]">Dashboard</span></h1>
                        <p className="text-white/40">Manage your fleet, bookings, and revenue.</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Link href="/track" className="btn-secondary !bg-blue-500/10 !text-blue-500 !border-blue-500/20 flex items-center justify-center gap-2 !py-2.5 flex-1 min-w-[140px] md:flex-none">
                            <Navigation className="w-4 h-4" /> Live Map
                        </Link>
                        <Link href="/admin/customers" className="btn-secondary !bg-purple-500/10 !text-purple-500 !border-purple-500/20 flex items-center justify-center gap-2 !py-2.5 flex-1 min-w-[140px] md:flex-none">
                            <Users className="w-4 h-4" /> Customers
                        </Link>
                        <Link href="/admin/fleet" className="btn-secondary flex items-center justify-center gap-2 !py-2.5 flex-1 min-w-[140px] md:flex-none">
                            <Settings className="w-4 h-4" /> Management
                        </Link>
                        <Link href="/admin/scooters/new" className="btn-primary flex items-center justify-center gap-2 !py-2.5 w-full md:w-auto">
                            <Plus className="w-4 h-4" /> Add New Scooter
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {stats.map((stat, i) => (
                        <div key={i} className="glass-card p-6 border-white/5">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-xl ${stat.bg}`}>
                                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                                <TrendingUp className="w-4 h-4 text-green-500" />
                            </div>
                            <p className="text-xs font-bold text-white/40 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-2xl font-bold mt-1">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Live Tracking Map Section */}
                <div className="mb-12 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Live Fleet Tracking</h2>
                        <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-green-500">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            Live Updates Active
                        </span>
                    </div>
                    <div className="glass-card p-4 border-white/5">
                        <TrackingMap activeBookings={bookings.filter(b => b.status === "Active")} />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Requests Table */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold">Recent Rental Requests</h2>
                        </div>

                        <div className="glass-card overflow-hidden border-white/5">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white/5 border-b border-white/10">
                                            <th className="p-4 text-[10px] font-bold uppercase text-white/40">Reference</th>
                                            <th className="p-4 text-[10px] font-bold uppercase text-white/40">Rider</th>
                                            <th className="p-4 text-[10px] font-bold uppercase text-white/40">Scooter</th>
                                            <th className="p-4 text-[10px] font-bold uppercase text-white/40">Status</th>
                                            <th className="p-4 text-[10px] font-bold uppercase text-white/40 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {bookings.map((booking) => (
                                            <tr key={booking.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="p-4 text-sm font-medium">{booking.id.slice(0, 8)}</td>
                                                <td className="p-4">
                                                    <p className="text-sm font-bold">{booking.riderName}</p>
                                                    <p className="text-[10px] text-white/40">{new Date(booking.createdAt).toLocaleDateString()}</p>
                                                </td>
                                                <td className="p-4 text-sm text-white/80">{booking.scooter?.name}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${booking.status === 'Pending' ? 'bg-[var(--secondary)]/10 text-[var(--secondary)]' :
                                                        booking.status === 'Active' ? 'bg-[var(--primary)]/10 text-[var(--primary)]' :
                                                            'bg-white/10 text-white/60'
                                                        }`}>
                                                        {booking.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => setSelectedCustomer(booking)}
                                                            className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors"
                                                            title="View Identity"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(booking.id, 'Active')}
                                                            className="p-2 hover:bg-white/10 rounded-lg text-[var(--primary)] transition-colors"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(booking.id, 'Completed')}
                                                            className="p-2 hover:bg-white/10 rounded-lg text-green-500 transition-colors"
                                                            title="Mark Completed"
                                                        >
                                                            <CheckCircle2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                const start = new Date(booking.startDate);
                                                                const end = new Date(booking.endDate);
                                                                const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                                                                const pricePerDay = booking.scooter?.pricePerDay || 0;

                                                                generateRentalAgreement({
                                                                    id: booking.id,
                                                                    rider: booking.riderName,
                                                                    bike: booking.scooter?.name,
                                                                    date: new Date(booking.createdAt).toLocaleDateString(),
                                                                    rentalPeriod: `${new Date(booking.startDate).toLocaleDateString()} - ${new Date(booking.endDate).toLocaleDateString()}`,
                                                                    amount: `$${booking.totalAmount}`,
                                                                    numberOfDays: days,
                                                                    pricePerDay: pricePerDay,
                                                                    details: {
                                                                        passport: booking.riderPassport,
                                                                        phone: booking.riderPhone,
                                                                        idFront: booking.documents?.idFront,
                                                                        idBack: booking.documents?.idBack,
                                                                        passportImg: booking.documents?.passport,
                                                                        signature: booking.documents?.signature
                                                                    }
                                                                });
                                                            }}
                                                            className="p-2 hover:bg-white/10 rounded-lg text-blue-500 transition-colors"
                                                            title="Download Agreement"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Fleet Status */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold">Fleet Performance</h2>
                        <div className="glass-card p-6 space-y-6">
                            {SCOOTERS.slice(0, 3).map((scooter) => (
                                <div key={scooter.id} className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex-shrink-0">
                                        <img src={scooter.image} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold truncate">{scooter.name}</p>
                                        <div className="w-full h-1.5 bg-white/5 rounded-full mt-2 overflow-hidden">
                                            <div className="h-full bg-[var(--primary)] rounded-full" style={{ width: `${scooter.rating * 20}%` }}></div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold">${scooter.pricePerDay}</p>
                                        <p className="text-[10px] text-white/40 uppercase font-bold">/ Day Rate</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Identity Modal */}
            {selectedCustomer && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[var(--background)]/90 backdrop-blur-md" onClick={() => setSelectedCustomer(null)}></div>
                    <div className="relative glass-card border-[var(--primary)]/20 w-full max-w-4xl max-h-[90vh] overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-300">
                        <div className="sticky top-0 bg-[#0a0c0f] p-6 border-b border-white/10 flex items-center justify-between">
                            <h3 className="text-xl font-bold">{selectedCustomer.riderName}</h3>
                            <button onClick={() => setSelectedCustomer(null)} className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <img src={selectedCustomer.documents?.idFront || "/images/id-front-template.png"} alt="ID Front" className="rounded-2xl border border-white/10" />
                                <img src={selectedCustomer.documents?.idBack || "/images/id-back-template.png"} alt="ID Back" className="rounded-2xl border border-white/10" />
                            </div>
                        </div>
                        <div className="p-6 border-t border-white/10 flex justify-end">
                            <button
                                onClick={() => {
                                    const start = new Date(selectedCustomer.startDate);
                                    const end = new Date(selectedCustomer.endDate);
                                    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                                    const pricePerDay = selectedCustomer.scooter?.pricePerDay || 0;

                                    generateRentalAgreement({
                                        id: selectedCustomer.id,
                                        rider: selectedCustomer.riderName,
                                        bike: selectedCustomer.scooter?.name,
                                        date: new Date(selectedCustomer.createdAt).toLocaleDateString(),
                                        rentalPeriod: `${new Date(selectedCustomer.startDate).toLocaleDateString()} - ${new Date(selectedCustomer.endDate).toLocaleDateString()}`,
                                        amount: `$${selectedCustomer.totalAmount}`,
                                        numberOfDays: days,
                                        pricePerDay: pricePerDay,
                                        details: {
                                            passport: selectedCustomer.riderPassport,
                                            phone: selectedCustomer.riderPhone,
                                            idFront: selectedCustomer.documents?.idFront,
                                            idBack: selectedCustomer.documents?.idBack,
                                            passportImg: selectedCustomer.documents?.passport,
                                            signature: selectedCustomer.documents?.signature
                                        }
                                    });
                                }}
                                className="flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-black font-bold rounded-xl hover:bg-[var(--primary)]/90 transition-colors"
                            >
                                <Download className="w-5 h-5" /> Download Agreement
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

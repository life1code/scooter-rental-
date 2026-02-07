"use client";

import { Navbar } from "@/frontend/components/Navbar";

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
    Navigation,
    AlertTriangle,
    Building2,
    ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/backend/lib/utils";
import { generateRentalAgreement } from "@/reportservice/pdf-service";
import { simulateEmailNotification } from "@/reportservice/email-service";
import { useToast } from "@/frontend/components/ToastProvider";

interface Booking {
    id: string;
    rider: string;
    bike: string;
    date: string;
    status: string;
    amount: string;
}
const TrackingMap = ({ activeBookings, allScooters }: { activeBookings: any[], allScooters: any[] }) => {
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

    const getIcon = (status: string) => {
        const color = status === 'Active' ? 'blue' : status === 'Available' ? 'green' : 'orange';
        return L.icon({
            iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
        });
    };

    // Combine active bookings with GPS and scooters with GPS
    const activeWithGPS = activeBookings.filter(b => b.lastLat && b.lastLng);
    const scootersWithGPS = allScooters.filter(s => s.lastLat && s.lastLng && !activeWithGPS.find(b => b.scooterId === s.id));

    return (
        <div className="w-full h-[400px] rounded-2xl overflow-hidden border border-white/10 relative z-10">
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
            <style>{`
                .leaflet-container { background: #0a0c0f !important; }
                .leaflet-tile { filter: grayscale(1) invert(1) opacity(0.2); }
            `}</style>
            <MapContainer center={[6.0022, 80.2484]} zoom={13} className="w-full h-full">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {/* Active Rentals (Blue) */}
                {activeWithGPS.map((booking) => (
                    <Marker key={booking.id} position={[booking.lastLat, booking.lastLng]} icon={getIcon('Active')}>
                        <Popup>
                            <div className="text-black min-w-[120px]">
                                <p className="font-bold border-b pb-1 mb-1">{booking.riderName}</p>
                                <p className="text-xs text-blue-600 font-bold uppercase">{booking.scooter?.name}</p>
                                <p className="text-[10px] text-gray-500 italic">Currently Rented</p>
                                <div className="mt-2 text-[10px] flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                    Live tracking active
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Available Scooters (Green) */}
                {scootersWithGPS.map((scooter) => (
                    <Marker key={scooter.id} position={[scooter.lastLat, scooter.lastLng]} icon={getIcon('Available')}>
                        <Popup>
                            <div className="text-black min-w-[120px]">
                                <p className="font-bold border-b pb-1 mb-1">{scooter.name}</p>
                                <p className="text-xs text-green-600 font-bold uppercase">{scooter.status}</p>
                                <p className="text-[10px] text-gray-500">Available for rent</p>
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
    const { showToast } = useToast();
    const router = useRouter();
    const [bookings, setBookings] = useState<any[]>([]);
    const [scooters, setScooters] = useState<any[]>([]);
    const [stats, setStats] = useState<any[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [confirmAction, setConfirmAction] = useState<{ id: string, status: string } | null>(null);

    const [pendingHosts, setPendingHosts] = useState<any[]>([]);
    const [view, setView] = useState<'overview' | 'hosts'>('overview');

    const userRole = (session?.user as any)?.role;
    const approvalStatus = (session?.user as any)?.approvalStatus;
    const isSuperAdmin = userRole === "superadmin";

    useEffect(() => {
        if (status === "loading") return;

        if (status === "unauthenticated") {
            router.push("/admin/login");
            return;
        }

        if (userRole !== "admin" && userRole !== "host" && userRole !== "superadmin") {
            router.push("/");
        }
    }, [status, session, router, userRole]);

    const fetchPendingHosts = async () => {
        if (!isSuperAdmin) return;
        try {
            const res = await fetch('/api/admin/hosts');
            if (res.ok) {
                const data = await res.json();
                setPendingHosts(data);
            }
        } catch (error) {
            console.error("Failed to fetch hosts:", error);
        }
    };

    const handleHostApproval = async (hostId: string, approvalStatus: string) => {
        try {
            const res = await fetch('/api/admin/hosts', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hostId, status: approvalStatus })
            });
            if (res.ok) {
                showToast(`Host ${approvalStatus}`, "success");
                fetchPendingHosts();
            }
        } catch (error) {
            showToast("Failed to update host", "error");
        }
    };

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

    const fetchScooters = async () => {
        try {
            const res = await fetch('/api/scooters?admin=true');
            if (res.ok) {
                const data = await res.json();
                setScooters(data);
            }
        } catch (error) {
            console.error("Failed to fetch scooters:", error);
        }
    };

    const downloadFleetReport = () => {
        const headers = ["Scooter Name", "Model", "Price/Day", "Total Revenue", "Total Rentals", "Total Days Rented", "Current Status"];

        const rows = scooters.map(s => {
            // Aggregate booking data for this scooter
            const scooterBookings = bookings.filter(b => b.scooter?.id === s.id);

            const revenue = scooterBookings.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
            const rentals = scooterBookings.length;

            const daysRented = scooterBookings.reduce((sum, b) => {
                if (!b.startDate || !b.endDate) return sum;
                const start = new Date(b.startDate);
                const end = new Date(b.endDate);
                const diffTime = Math.abs(end.getTime() - start.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return sum + (diffDays > 0 ? diffDays : 0);
            }, 0);

            return [
                `"${s.name}"`, // Quote to handle commas
                `"${s.model}"`,
                `$${s.pricePerDay}`,
                `$${revenue.toFixed(2)}`,
                rentals,
                daysRented,
                s.status
            ].join(",");
        });

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `fleet_performance_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    useEffect(() => {
        fetchBookings();
        fetchScooters();
        if (isSuperAdmin) fetchPendingHosts();

        const interval = setInterval(() => {
            fetchBookings();
            if (isSuperAdmin) fetchPendingHosts();
        }, 10000);
        return () => clearInterval(interval);
    }, [isSuperAdmin]);

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
        setConfirmAction({ id, status: newStatus });
    };

    const processAction = async () => {
        if (!confirmAction) return;
        const { id, status: newStatus } = confirmAction;
        setConfirmAction(null);

        try {
            const res = await fetch(`/api/bookings/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                showToast(`Booking status updated to ${newStatus}`, "success");
                // Send approval email
                if (newStatus === 'Active') {
                    const booking = bookings.find(b => b.id === id);
                    if (booking) {
                        simulateEmailNotification('approval', {
                            id: booking.id,
                            rider: booking.riderName,
                            riderEmail: booking.riderEmail,
                            bike: booking.scooter?.name,
                            ownerWhatsapp: booking.scooter?.ownerWhatsapp
                        });
                    }
                }
                fetchBookings();
            } else {
                showToast("Failed to update status", "error");
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
                        <h1 className="text-4xl font-bold tracking-tight">
                            {isSuperAdmin ? "Super Admin" : "Host"} <span className="text-[var(--primary)]">Dashboard</span>
                        </h1>
                        <p className="text-white/40">
                            {isSuperAdmin
                                ? "Manage all institutions, hosts, and global fleet."
                                : `Managing fleet for ${(session?.user as any)?.institutionName || 'your institution'}`
                            }
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {isSuperAdmin && (
                            <button
                                onClick={() => setView(view === 'overview' ? 'hosts' : 'overview')}
                                className={cn(
                                    "btn-secondary flex items-center justify-center gap-2 !py-2.5 flex-1 min-w-[140px] md:flex-none",
                                    view === 'hosts' && "!bg-[var(--primary)] !text-black border-none"
                                )}
                            >
                                <Users className="w-4 h-4" /> {view === 'hosts' ? "Back to Overview" : "Manage Hosts"}
                            </button>
                        )}
                        <Link href="/track" className="btn-secondary !bg-blue-500/10 !text-blue-500 !border-blue-500/20 flex items-center justify-center gap-2 !py-2.5 flex-1 min-w-[140px] md:flex-none">
                            <Navigation className="w-4 h-4" /> Live Map
                        </Link>
                        {!isSuperAdmin && (
                            <Link href="/admin/scooters/new" className="btn-primary flex items-center justify-center gap-2 !py-2.5 w-full md:w-auto">
                                <Plus className="w-4 h-4" /> Add New Scooter
                            </Link>
                        )}
                    </div>
                </div>

                {userRole === 'host' && approvalStatus === 'pending' ? (
                    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6 animate-in fade-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-[var(--secondary)]/10 rounded-full flex items-center justify-center mb-4">
                            <Clock className="w-12 h-12 text-[var(--secondary)]" />
                        </div>
                        <h2 className="text-3xl font-bold">Account Pending Approval</h2>
                        <p className="text-white/60 max-w-md text-lg">
                            Your host account is currently under review by our Super Admin team. 
                            You will receive an email once your account is verified and approved.
                        </p>
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10 max-w-sm w-full">
                            <p className="text-sm font-bold text-white/40 uppercase tracking-widest mb-1">Status</p>
                            <div className="flex items-center justify-center gap-2 text-[var(--secondary)] font-bold">
                                <span className="w-2 h-2 bg-[var(--secondary)] rounded-full animate-pulse"></span>
                                Awaiting Verification
                            </div>
                        </div>
                        <button 
                            onClick={() => window.location.reload()}
                            className="btn-secondary mt-4"
                        >
                            Check Status Again
                        </button>
                    </div>
                ) : (
                    <>
                        {view === 'hosts' && isSuperAdmin ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <Building2 className="w-6 h-6 text-[var(--primary)]" />
                                Host Applications
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {pendingHosts.map((host) => (
                                <div key={host.id} className="glass-card p-6 border-white/5 flex flex-col md:flex-row gap-6">
                                    <div className="w-32 h-44 bg-white/5 rounded-xl overflow-hidden shrink-0 border border-white/10 group cursor-pointer relative">
                                        <img src={host.nicPhoto} alt="NIC" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Eye className="w-6 h-6" />
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-[var(--primary)]">{host.institutionName}</h3>
                                            <p className="text-sm text-white/60">{host.institutionAddress}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-[10px] font-bold uppercase tracking-widest">
                                            <div>
                                                <p className="text-white/20 mb-1">Host Name</p>
                                                <p className="text-white/80">{host.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-white/20 mb-1">NIC Number</p>
                                                <p className="text-white/80">{host.nicNumber}</p>
                                            </div>
                                            <div>
                                                <p className="text-white/20 mb-1">Contact</p>
                                                <p className="text-white/80">{host.phoneNumber}</p>
                                            </div>
                                            <div>
                                                <p className="text-white/20 mb-1">Status</p>
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded text-[8px]",
                                                    host.approvalStatus === 'approved' ? "bg-green-500/10 text-green-500" :
                                                        host.approvalStatus === 'pending' ? "bg-orange-500/10 text-orange-500" :
                                                            "bg-red-500/10 text-red-500"
                                                )}>
                                                    {host.approvalStatus}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            {host.approvalStatus !== 'approved' && (
                                                <button
                                                    onClick={() => handleHostApproval(host.id, 'approved')}
                                                    className="flex-1 py-2 bg-green-500 text-black font-bold rounded-lg text-xs hover:bg-green-400 transition-colors"
                                                >
                                                    Approve
                                                </button>
                                            )}
                                            {host.approvalStatus !== 'rejected' && (
                                                <button
                                                    onClick={() => handleHostApproval(host.id, 'rejected')}
                                                    className="flex-1 py-2 bg-white/5 text-red-500 border border-red-500/20 font-bold rounded-lg text-xs hover:bg-red-500/10 transition-colors"
                                                >
                                                    Reject
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Normal Overview View */}

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
                                <TrackingMap activeBookings={bookings.filter(b => b.status === "Active")} allScooters={scooters} />
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
                                                    {isSuperAdmin && <th className="p-4 text-[10px] font-bold uppercase text-white/40">Institution</th>}
                                                    <th className="p-4 text-[10px] font-bold uppercase text-white/40">Scooter</th>
                                                    <th className="p-4 text-[10px] font-bold uppercase text-white/40">Pickup</th>
                                                    <th className="p-4 text-[10px] font-bold uppercase text-white/40">Return</th>
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
                                                        {isSuperAdmin && (
                                                            <td className="p-4">
                                                                <span className="text-[10px] font-bold text-[var(--primary)] bg-[var(--primary)]/5 px-2 py-1 rounded uppercase tracking-wider">
                                                                    {booking.scooter?.host?.institutionName || "Ride Admin"}
                                                                </span>
                                                            </td>
                                                        )}
                                                        <td className="p-4 text-sm text-white/80">{booking.scooter?.name}</td>
                                                        <td className="p-4 text-xs text-white/60">{new Date(booking.startDate).toLocaleDateString()}</td>
                                                        <td className="p-4 text-xs text-white/60">{new Date(booking.endDate).toLocaleDateString()}</td>
                                                        <td className="p-4">
                                                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${booking.status === 'Pending' ? 'bg-[var(--secondary)]/10 text-[var(--secondary)]' :
                                                                booking.status === 'Active' ? 'bg-[var(--primary)]/10 text-[var(--primary)]' :
                                                                    booking.status === 'Cancelled' ? 'bg-red-500/10 text-red-500' :
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
                                                                    onClick={() => handleAction(booking.id, 'Cancelled')}
                                                                    className="p-2 hover:bg-white/10 rounded-lg text-red-500 transition-colors"
                                                                    title="Cancel Booking"
                                                                >
                                                                    <XCircle className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        const start = new Date(booking.startDate);
                                                                        const end = new Date(booking.endDate);
                                                                        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

                                                                        // Calculate discount
                                                                        let discount = 0;
                                                                        if (days >= 30) discount = 12;
                                                                        else if (days >= 7) discount = 5;

                                                                        generateRentalAgreement({
                                                                            id: booking.id,
                                                                            rider: booking.riderName,
                                                                            bike: booking.scooter?.name,
                                                                            date: new Date(booking.createdAt).toLocaleDateString(),
                                                                            bookingTime: new Date(booking.createdAt).toLocaleTimeString(),
                                                                            rentalPeriod: `${new Date(booking.startDate).toLocaleDateString()} - ${new Date(booking.endDate).toLocaleDateString()}`,
                                                                            amount: `$${booking.totalAmount}`,
                                                                            pricePerDay: booking.scooter?.pricePerDay,
                                                                            discount: discount,
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
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold">Fleet Performance</h2>
                                    <button
                                        onClick={downloadFleetReport}
                                        className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)]/10 text-[var(--primary)] font-bold rounded-xl hover:bg-[var(--primary)]/20 transition-colors text-xs uppercase tracking-wider"
                                    >
                                        <Download className="w-4 h-4" /> Download Report
                                    </button>
                                </div>
                                <div className="glass-card p-6 space-y-6 max-h-[600px] overflow-y-auto custom-scrollbar">
                                    {scooters.map((scooter) => {
                                        // Calculate revenue for display
                                        const scooterRevenue = bookings
                                            .filter(b => b.scooter?.id === scooter.id)
                                            .reduce((acc, b) => acc + (Number(b.totalAmount) || 0), 0);

                                        return (
                                            <div key={scooter.id} className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex-shrink-0">
                                                    <img src={scooter.image} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <p className="text-sm font-bold truncate">{scooter.name}</p>
                                                        <p className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded uppercase">{scooterRevenue > 0 ? `+$${scooterRevenue}` : '$0'}</p>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-white/5 rounded-full mt-2 overflow-hidden">
                                                        <div className="h-full bg-[var(--primary)] rounded-full" style={{ width: `${(scooter.rating || 5) * 20}%` }}></div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-bold">${scooter.pricePerDay}</p>
                                                    <p className="text-[10px] text-white/40 uppercase font-bold">/ Day Rate</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Confirmation Modal */}
                <AnimatePresence>
                    {confirmAction && (
                        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-[#000]/60 backdrop-blur-sm"
                                onClick={() => setConfirmAction(null)}
                            />
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="relative glass-card border-[var(--primary)]/20 p-8 w-full max-w-sm text-center shadow-2xl bg-[#1e2124]"
                            >
                                <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <AlertTriangle className="w-8 h-8 text-[var(--primary)]" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">{confirmAction.status === 'Cancelled' ? 'Cancel Booking?' : 'Confirm Action'}</h3>
                                <p className="text-white/60 text-sm mb-8">
                                    {confirmAction.status === 'Cancelled'
                                        ? `Are you sure you want to cancel booking #${confirmAction.id.slice(0, 6)}?`
                                        : `Do you approve this booking for ID #${confirmAction.id.slice(0, 6)}?`
                                    }
                                </p>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setConfirmAction(null)}
                                        className="flex-1 px-6 py-3 rounded-xl border border-white/10 text-white/60 font-bold hover:bg-white/5 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={processAction}
                                        className={cn(
                                            "flex-1 px-6 py-3 rounded-xl font-bold transition-all",
                                            confirmAction.status === 'Cancelled'
                                                ? "bg-red-500 text-white hover:bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                                                : "bg-[var(--primary)] text-black hover:bg-[var(--primary)]/90 shadow-[0_0_20px_rgba(45,212,191,0.3)]"
                                        )}
                                    >
                                        {confirmAction.status === 'Cancelled' ? "Yes, Cancel It" : "Yes, Approve"}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

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

                                        // Calculate discount
                                        let discount = 0;
                                        if (days >= 30) discount = 12;
                                        else if (days >= 7) discount = 5;

                                        generateRentalAgreement({
                                            id: selectedCustomer.id,
                                            rider: selectedCustomer.riderName,
                                            bike: selectedCustomer.scooter?.name,
                                            date: new Date(selectedCustomer.createdAt).toLocaleDateString(),
                                            bookingTime: new Date(selectedCustomer.createdAt).toLocaleTimeString(),
                                            rentalPeriod: `${new Date(selectedCustomer.startDate).toLocaleDateString()} - ${new Date(selectedCustomer.endDate).toLocaleDateString()}`,
                                            amount: `$${selectedCustomer.totalAmount}`,
                                            pricePerDay: selectedCustomer.scooter?.pricePerDay,
                                            discount: discount,
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
                    </>
                )}
            </div>
        </main>
    );
}

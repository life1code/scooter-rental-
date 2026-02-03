"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/frontend/components/Navbar";
import {
    ArrowLeft,
    Search,
    Filter,
    Eye,
    CheckCircle2,
    XCircle,
    User,
    ShieldCheck,
    FileText,
    ExternalLink,
    X
} from "lucide-react";
import Link from "next/link";

interface Customer {
    id: string;
    name: string;
    email: string;
    passportNumber: string;
    status: 'Verified' | 'Pending' | 'Rejected';
    joinDate: string;
    idBack: string;
    idFront: string;
}

export default function CustomerManagement() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [customers, setCustomers] = useState<Customer[]>([]);

    // Define allowed admin emails
    const ADMIN_EMAILS = ['rydexpvtltd@gmail.com', 'smilylife996cha@gmail.com'];

    // Initial check for admin session
    useEffect(() => {
        async function checkAuthAndFetch() {
            // Check if user is authenticated admin
            const sessionRes = await fetch('/api/auth/session');
            const session = await sessionRes.json();

            const isAdmin = session?.user?.email && ADMIN_EMAILS.includes(session.user.email);

            if (!isAdmin) {
                router.push("/admin/login");
                return;
            }

            // Fetch customers
            try {
                const res = await fetch('/api/bookings');
                if (res.ok) {
                    const dbBookings = await res.json();

                    const dynamicCustomers: Customer[] = dbBookings.map((b: any) => ({
                        id: b.id,
                        name: b.riderName || "Unknown Rider",
                        email: b.riderEmail || (b.riderName ? `${b.riderName.toLowerCase().replace(/\s+/g, '.')}@example.com` : "no-email@example.com"),
                        passportNumber: b.riderPassport || "N/A",
                        status: b.verificationStatus || 'Pending',
                        joinDate: new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                        idFront: b.documents?.idFront || "/images/id-front-template.png",
                        idBack: b.documents?.idBack || "/images/id-back-template.png"
                    }));

                    // Load static customers
                    const staticCustomers: Customer[] = [
                        {
                            id: "CUST-001",
                            name: "Alex Smith",
                            email: "alex@example.com",
                            passportNumber: "N1234567",
                            status: 'Verified',
                            joinDate: "Jan 15, 2026",
                            idFront: "/images/id-front-template.png",
                            idBack: "/images/id-back-template.png"
                        }
                    ];

                    setCustomers([...dynamicCustomers, ...staticCustomers]);
                }
            } catch (error) {
                console.error("Failed to fetch customers:", error);
            }
        }
    }

        checkAuthAndFetch();
}, [router]);

const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.passportNumber.toLowerCase().includes(searchTerm.toLowerCase())
);

const handleVerify = (id: string, status: 'Verified' | 'Rejected') => {
    setCustomers(customers.map(c => c.id === id ? { ...c, status } : c));
    if (selectedCustomer?.id === id) {
        setSelectedCustomer(prev => prev ? { ...prev, status } : null);
    }

    // Persist to localStorage if it's a dynamic booking
    const recentBookings = JSON.parse(localStorage.getItem("recent_bookings") || "[]");
    const updatedBookings = recentBookings.map((b: any) =>
        b.id === id ? { ...b, verificationStatus: status } : b
    );
    localStorage.setItem("recent_bookings", JSON.stringify(updatedBookings));
};

return (
    <main className="min-h-screen pb-20">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 pt-12">
            <Link href="/admin" className="inline-flex items-center gap-2 text-white/40 hover:text-[var(--primary)] transition-colors mb-8 group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-widest">Back to Dashboard</span>
            </Link>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">Customer <span className="text-[var(--primary)]">Identity</span></h1>
                    <p className="text-white/40">Manage and verify rider documentation.</p>
                </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input
                        type="text"
                        placeholder="Search by name or passport..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[var(--primary)] transition-all"
                    />
                </div>
                <button className="btn-secondary flex items-center gap-2 px-6">
                    <Filter className="w-4 h-4" /> Filters
                </button>
            </div>

            {/* Customers Table */}
            <div className="glass-card overflow-hidden border-white/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10">
                                <th className="p-4 text-[10px] font-bold uppercase text-white/40">Customer</th>
                                <th className="p-4 text-[10px] font-bold uppercase text-white/40">Passport / ID</th>
                                <th className="p-4 text-[10px] font-bold uppercase text-white/40">Verification</th>
                                <th className="p-4 text-[10px] font-bold uppercase text-white/40">Join Date</th>
                                <th className="p-4 text-[10px] font-bold uppercase text-white/40 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredCustomers.map((customer) => (
                                <tr key={customer.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                                <User className="w-5 h-5 text-white/40" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold">{customer.name}</p>
                                                <p className="text-[10px] text-white/40">{customer.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-3 h-3 text-white/20" />
                                            <span className="text-sm font-medium uppercase">{customer.passportNumber}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${customer.status === 'Verified' ? 'bg-green-500/10 text-green-500' :
                                            customer.status === 'Pending' ? 'bg-[var(--secondary)]/10 text-[var(--secondary)]' :
                                                'bg-red-500/10 text-red-500'
                                            }`}>
                                            {customer.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-white/40">{customer.joinDate}</td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => setSelectedCustomer(customer)}
                                            className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors"
                                            title="View Identity Documents"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* Identity Modal */}
        {selectedCustomer && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-[var(--background)]/90 backdrop-blur-md" onClick={() => setSelectedCustomer(null)}></div>
                <div className="relative glass-card border-[var(--primary)]/20 w-full max-w-4xl max-h-[90vh] overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-300">
                    <div className="sticky top-0 bg-[#0a0c0f] p-6 border-b border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-[var(--primary)]/10">
                                <ShieldCheck className="w-5 h-5 text-[var(--primary)]" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">{selectedCustomer.name}</h3>
                                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Passport: {selectedCustomer.passportNumber}</p>
                            </div>
                        </div>
                        <button onClick={() => setSelectedCustomer(null)} className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Front Side of ID</h4>
                                <div className="aspect-[1.6/1] bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden relative group">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    <img src={selectedCustomer.idFront} alt="ID Front" className="w-full h-full object-cover" />
                                    <div className="absolute bottom-4 right-4 p-2 rounded-lg bg-black/50 backdrop-blur-md border border-white/10">
                                        <ExternalLink className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Back Side of ID</h4>
                                <div className="aspect-[1.6/1] bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden relative group">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    <img src={selectedCustomer.idBack} alt="ID Back" className="w-full h-full object-cover" />
                                    <div className="absolute bottom-4 right-4 p-2 rounded-lg bg-black/50 backdrop-blur-md border border-white/10">
                                        <ExternalLink className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button
                                onClick={() => handleVerify(selectedCustomer.id, 'Verified')}
                                disabled={selectedCustomer.status === 'Verified'}
                                className="flex-1 btn-primary !py-4 flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(45,212,191,0.2)] disabled:opacity-50"
                            >
                                <CheckCircle2 className="w-5 h-5" />
                                <span className="font-bold">Approve Identity</span>
                            </button>
                            <button
                                onClick={() => handleVerify(selectedCustomer.id, 'Rejected')}
                                disabled={selectedCustomer.status === 'Rejected'}
                                className="flex-1 btn-secondary !py-4 flex items-center justify-center gap-2 border-red-500/20 text-red-500 hover:bg-red-500/10 disabled:opacity-50"
                            >
                                <XCircle className="w-5 h-5" />
                                <span className="font-bold">Reject Verification</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </main>
);
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/frontend/components/Navbar";
import { SCOOTERS } from "@/backend/data/scooters";
import {
    ArrowLeft,
    Search,
    Filter,
    Edit2,
    Trash2,
    Eye,
    MoreVertical,
    CheckCircle2,
    XCircle,
    Plus
} from "lucide-react";
import Link from "next/link";

export default function FleetManagement() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [allScooters, setAllScooters] = useState(SCOOTERS);

    // Initial check for admin session
    useEffect(() => {
        const isAdmin = localStorage.getItem("is_host_admin") === "true";
        if (!isAdmin) {
            router.push("/admin/login");
        }

        // Load custom scooters and merge with static ones (preferring custom overrides)
        const customScooters = JSON.parse(localStorage.getItem("custom_scooters") || "[]");

        const merged = SCOOTERS.map(staticS => {
            const override = customScooters.find((c: any) => c.id === staticS.id);
            return override || staticS;
        });

        // Add new custom scooters that aren't overrides
        const additional = customScooters.filter((c: any) => !SCOOTERS.some(s => s.id === c.id));

        setAllScooters([...merged, ...additional]);
    }, [router]);

    const handleDelete = (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to remove ${name} from your fleet?`)) {
            const customScooters = JSON.parse(localStorage.getItem("custom_scooters") || "[]");
            const updatedCustom = customScooters.filter((s: any) => s.id !== id);
            localStorage.setItem("custom_scooters", JSON.stringify(updatedCustom));

            // Update local state (only for custom ones, since we can't delete from static data easily without more complex state)
            setAllScooters(allScooters.filter(s => s.id !== id));
        }
    };

    const filteredScooters = allScooters.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                        <h1 className="text-4xl font-bold tracking-tight">Fleet <span className="text-[var(--primary)]">Management</span></h1>
                        <p className="text-white/40">Manage your collection of {allScooters.length} scooters.</p>
                    </div>
                    <Link href="/admin/scooters/new" className="btn-primary flex items-center gap-2 !py-2.5">
                        <Plus className="w-4 h-4" /> Add New Scooter
                    </Link>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                        <input
                            type="text"
                            placeholder="Search by model or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[var(--primary)] transition-all"
                        />
                    </div>
                    <button className="btn-secondary flex items-center gap-2 px-6">
                        <Filter className="w-4 h-4" /> Filters
                    </button>
                </div>

                {/* Fleet Table */}
                <div className="glass-card overflow-hidden border-white/5">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/10">
                                    <th className="p-4 text-[10px] font-bold uppercase text-white/40">Scooter</th>
                                    <th className="p-4 text-[10px] font-bold uppercase text-white/40">Status</th>
                                    <th className="p-4 text-[10px] font-bold uppercase text-white/40">Price/Day</th>
                                    <th className="p-4 text-[10px] font-bold uppercase text-white/40">Rating</th>
                                    <th className="p-4 text-[10px] font-bold uppercase text-white/40 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredScooters.map((scooter) => (
                                    <tr key={scooter.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 border border-white/10 shrink-0">
                                                    <img src={scooter.image} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold">{scooter.name}</p>
                                                    <p className="text-[10px] text-white/40 uppercase tracking-widest">{scooter.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 rounded-md bg-[var(--primary)]/10 text-[var(--primary)] text-[10px] font-bold uppercase tracking-wider">
                                                Available
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm font-medium">${scooter.pricePerDay}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-1 text-[var(--secondary)] font-bold text-xs">
                                                ★ {scooter.rating}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                <Link
                                                    href={`/scooters/${scooter.id}`}
                                                    className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors"
                                                    title="View Public Listing"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <Link
                                                    href={`/admin/scooters/edit/${scooter.id}`}
                                                    className="p-2 hover:bg-white/10 rounded-lg text-blue-400 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(scooter.id, scooter.name)}
                                                    className="p-2 hover:bg-white/10 rounded-lg text-red-500 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
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
        </main>
    );
}

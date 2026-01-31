"use client";

import { Navbar } from "@/frontend/components/Navbar";
import { ShieldAlert, Info, AlertTriangle, Scale, PhoneCall, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function PolicyPage() {
    return (
        <main className="min-h-screen bg-[var(--background)] pb-20">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 pt-12">
                <Link href="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8">
                    <ChevronLeft className="w-5 h-5" />
                    <span>Back to Home</span>
                </Link>

                <div className="space-y-12">
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-[var(--secondary)]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <ShieldAlert className="w-10 h-10 text-[var(--secondary)]" />
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight">Rules & <span className="text-[var(--secondary)]">Regulations</span></h1>
                        <p className="text-white/40 max-w-xl mx-auto">Essential information for riding safely and legally in Sri Lanka.</p>
                    </div>

                    {/* Police Notices */}
                    <div className="glass-card p-8 border-[var(--secondary)]/20 shadow-[0_0_40px_rgba(249,115,22,0.1)]">
                        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
                            <AlertTriangle className="w-6 h-6 text-[var(--secondary)]" />
                            <h2 className="text-2xl font-bold uppercase tracking-widest">Sri Lankan Police Notice</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="font-bold flex items-center gap-2 text-[var(--secondary)]">
                                    <Scale className="w-4 h-4" /> Driving Permit
                                </h3>
                                <p className="text-sm text-white/60 leading-relaxed">
                                    Foreign nationals MUST carry a valid International Driving Permit (IDP) or a temporary Sri Lankan driving license issued by the DMV. Modern police checkpoints strictly enforce this.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <h3 className="font-bold flex items-center gap-2 text-[var(--secondary)]">
                                    Helmet Policy
                                </h3>
                                <p className="text-sm text-white/60 leading-relaxed">
                                    Helmets are mandatory for both driver and passenger. The helmet strap must be fastened. Riding without a helmet leads to immediate fines and possible bike impounding.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <h3 className="font-bold flex items-center gap-2 text-[var(--secondary)]">
                                    Speed Limits
                                </h3>
                                <p className="text-sm text-white/60 leading-relaxed">
                                    Standard speed limits are 40km/h in urban areas and 60-70km/h on main coastal roads. High-speed riding is dangerous and heavily fined.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <h3 className="font-bold flex items-center gap-2 text-[var(--secondary)]">
                                    One-Way Streets
                                </h3>
                                <p className="text-sm text-white/60 leading-relaxed">
                                    Galle Fort and many coastal towns have strict one-way systems. Pay close attention to road signs to avoid "wrong-way" violations.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Shop Notices */}
                    <div className="glass-card p-8">
                        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
                            <Info className="w-6 h-6 text-[var(--primary)]" />
                            <h2 className="text-2xl font-bold uppercase tracking-widest">Shop Policies</h2>
                        </div>

                        <ul className="space-y-6">
                            <li className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-white/5 flex-shrink-0 flex items-center justify-center text-xs font-bold text-[var(--primary)]">1</div>
                                <div>
                                    <h4 className="font-bold text-white/80">Full Tank Return</h4>
                                    <p className="text-xs text-white/40 mt-1">Scooters are provided with a full tank and must be returned full. A service charge apply otherwise.</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-white/5 flex-shrink-0 flex items-center justify-center text-xs font-bold text-[var(--primary)]">2</div>
                                <div>
                                    <h4 className="font-bold text-white/80">Flat Tires & Maintenance</h4>
                                    <p className="text-xs text-white/40 mt-1">Basic maintenance is covered. However, puncture repairs are the responsibility of the renter. Contact us for 24/7 support.</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-full bg-white/5 flex-shrink-0 flex items-center justify-center text-xs font-bold text-[var(--primary)]">3</div>
                                <div>
                                    <h4 className="font-bold text-white/80">Restricted Areas</h4>
                                    <p className="text-xs text-white/40 mt-1">Do not ride on beaches or through salt water. This causes severe engine damage and will result in forfeiture of your deposit.</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Emergency Contact */}
                    <div className="p-8 rounded-3xl bg-[var(--primary)] text-black flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_50px_rgba(45,212,191,0.2)]">
                        <div className="flex items-center gap-4">
                            <PhoneCall className="w-10 h-10" />
                            <div>
                                <h3 className="text-2xl font-bold">Need Help?</h3>
                                <p className="font-medium opacity-80 uppercase tracking-widest text-xs">24/7 Emergency Roadside Support</p>
                            </div>
                        </div>
                        <a href="tel:+94771234567" className="bg-black text-white px-8 py-4 rounded-2xl font-bold hover:scale-105 active:scale-95 transition-transform">
                            Call +94 77 123 4567
                        </a>
                    </div>
                </div>
            </div>
        </main>
    );
}

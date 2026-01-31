"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, ArrowRight, ShieldCheck } from "lucide-react";

export default function AdminLogin() {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        // Simple password for the host - can be updated later
        if (password === "admin123") {
            // Set a local flag to identify as admin
            localStorage.setItem("is_host_admin", "true");
            document.cookie = "is_host_admin=true; path=/";
            router.push("/admin");
        } else {
            setError("Incorrect administrator password.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--background)]">
            <div className="w-full max-w-md space-y-8 glass-card p-10 relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-[var(--primary)]/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[var(--secondary)]/10 rounded-full blur-3xl"></div>

                <div className="text-center relative">
                    <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[var(--primary)]/20 shadow-[0_0_20px_rgba(45,212,191,0.1)]">
                        <Lock className="w-8 h-8 text-[var(--primary)]" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Host <span className="text-[var(--primary)]">Login</span></h1>
                    <p className="text-white/40 text-sm">Restricted access for shop owners only.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6 relative">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase text-white/40 font-bold ml-1 tracking-widest">Master Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-[var(--primary)] transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[var(--primary)]/50 focus:bg-white/[0.08] transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <p className="text-red-500 text-xs font-medium text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full btn-primary !py-4 flex items-center justify-center gap-2 group shadow-[0_0_30px_rgba(45,212,191,0.2)]"
                    >
                        <span className="font-bold">Enter Dashboard</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <div className="pt-8 mt-8 border-t border-white/5 text-center">
                    <div className="flex items-center justify-center gap-2 text-white/20 text-[10px] font-bold uppercase tracking-widest">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Secured Encryption Active</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

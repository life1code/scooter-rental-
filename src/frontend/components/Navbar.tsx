"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { User, LogOut, Menu, Bike } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/backend/lib/utils";

export function Navbar() {
    const { data: session } = useSession();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLocalAdmin, setIsLocalAdmin] = useState(false);

    useEffect(() => {
        // Check for local admin login
        const isAdmin = localStorage.getItem("is_host_admin") === "true";
        setIsLocalAdmin(isAdmin);
    }, []);

    const isAdmin = session?.user?.email === "smilylife996cha@gmail.com" || isLocalAdmin;

    const handleSignOut = () => {
        localStorage.removeItem("is_host_admin");
        document.cookie = "is_host_admin=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        signOut();
    };

    return (
        <nav className="sticky top-0 z-50 w-full glass-card !rounded-none border-t-0 border-x-0 bg-[var(--background)]/80">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center">
                    <img src="/logo.png" alt="Rydex Logo" className="h-12 w-auto object-contain" />
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    <Link href="/" className="text-sm font-medium hover:text-[var(--primary)] transition-colors">Home</Link>
                    <Link href="/track" className="text-sm font-medium hover:text-[var(--primary)] transition-colors">My Bookings</Link>
                    <Link href="/reviews" className="text-sm font-medium hover:text-[var(--primary)] transition-colors">Reviews</Link>
                    <Link href="/policy" className="text-sm font-medium hover:text-[var(--primary)] transition-colors">Notices</Link>
                    {isAdmin && (
                        <Link href="/admin" className="text-sm font-medium hover:text-[var(--primary)] transition-colors">Admin</Link>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {session ? (
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:block text-right">
                                <p className="text-xs font-medium">{session.user?.name}</p>
                                <button
                                    onClick={handleSignOut}
                                    className="text-[10px] text-white/40 hover:text-[var(--secondary)] flex items-center gap-1 ml-auto"
                                >
                                    <LogOut className="w-2 h-2" /> Sign Out
                                </button>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-[var(--muted)] border border-white/10 flex items-center justify-center overflow-hidden">
                                {session.user?.image ? (
                                    <img src={session.user.image} alt="User" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-5 h-5 text-white/40" />
                                )}
                            </div>
                        </div>
                    ) : isAdmin ? (
                        /* Case for manual host login without Google session */
                        <button
                            onClick={handleSignOut}
                            className="btn-secondary !py-2 !px-4 text-xs flex items-center gap-2"
                        >
                            <LogOut className="w-3 h-3" /> Host Out
                        </button>
                    ) : (
                        <Link href="/auth/signin" className="btn-primary !py-2 !px-4 text-xs">
                            Sign In
                        </Link>
                    )}

                    <button
                        className="md:hidden p-2 text-white/60"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden glass-card !rounded-none border-x-0 border-b-0 p-4 space-y-4 animate-in slide-in-from-top-4">
                    <Link href="/" className="block text-lg font-medium">Home</Link>
                    <Link href="/track" className="block text-lg font-medium">My Bookings</Link>
                    <Link href="/reviews" className="block text-lg font-medium">Customer Reviews</Link>
                    <Link href="/policy" className="block text-lg font-medium">Police & Shop Notices</Link>
                    {isAdmin && (
                        <Link href="/admin" className="block text-lg font-medium">Admin Dashboard</Link>
                    )}
                </div>
            )}
        </nav>
    );
}

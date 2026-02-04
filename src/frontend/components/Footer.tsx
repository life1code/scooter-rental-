"use client";

import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";

export function Footer() {
    return (
        <footer className="bg-[#0a0c0f] border-t border-white/5 pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand & Description */}
                    <div className="lg:col-span-2 space-y-10">
                        <Link href="/" className="block">
                            <img src="/logo.png" alt="Rydex Logo" className="h-12 w-auto object-contain" />
                        </Link>
                        <p className="text-white/40 text-base leading-relaxed max-w-xl text-justify">
                            "Welcome to Rydex, your premier destination for freedom on two wheels.
                            Based in the heart of the Southern Province, we specialize in providing
                            travelers with high-quality scooters and bikes that are as reliable as they are stylish.
                            At Ceylon Rider, we believe the best way to see Sri Lanka is with the wind in your hair and
                            the freedom to stop wherever the view takes your breath away. With our easy-to-use
                            digital booking system and a commitment to rider safety, we make exploring Paradise simple,
                            secure, and unforgettable."
                        </p>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-white">Contact Us</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <Phone className="w-5 h-5 text-[var(--primary)] shrink-0" />
                                <span className="text-sm text-white/60">+94767856020</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Mail className="w-5 h-5 text-[var(--primary)] shrink-0" />
                                <span className="text-sm text-white/60">rydexpvtltd@gmail.com</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-[var(--primary)] shrink-0" />
                                <span className="text-sm text-white/60">No,64/1,Galketiya,Unawatuna,Galle.</span>
                            </li>
                        </ul>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-white">Quick Links</h3>
                        <ul className="space-y-2">
                            <li><Link href="/" className="text-sm text-white/40 hover:text-[var(--primary)] transition-colors">Home</Link></li>
                            <li><Link href="/track" className="text-sm text-white/40 hover:text-[var(--primary)] transition-colors">My Bookings</Link></li>
                            <li><Link href="/reviews" className="text-sm text-white/40 hover:text-[var(--primary)] transition-colors">Reviews</Link></li>
                            <li><Link href="/policy" className="text-sm text-white/40 hover:text-[var(--primary)] transition-colors">Notices</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-white/20">
                        © 2026 Rydex All Right Reserved. Developed by Rydex.
                    </p>
                    <div className="flex gap-6">
                        <Link href="/policy" className="text-[10px] uppercase font-bold tracking-widest text-white/20 hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="/policy" className="text-[10px] uppercase font-bold tracking-widest text-white/20 hover:text-white transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

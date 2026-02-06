"use client";

import { Mail, MapPin, Phone, Quote, Instagram } from "lucide-react";
import Link from "next/link";

export function Footer() {
    return (
        <footer className="bg-[#0a0c0f] border-t border-white/5 pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                    {/* Left: Brand & Description */}
                    <div className="space-y-10">
                        <Link href="/" className="block">
                            <img src="/logo.png" alt="Rydex Logo" className="h-12 w-auto object-contain" />
                        </Link>
                        <div className="relative">
                            <Quote className="w-8 h-8 text-[var(--primary)]/20 absolute -top-6 -left-4 -scale-x-100" />
                            <p className="text-white/40 text-base leading-relaxed max-w-xl text-justify relative z-10">
                                Welcome to Rydex, your premier destination for freedom on two wheels.
                                Based in the heart of the Southern Province, we specialize in providing
                                travelers with high-quality scooters and bikes that are as reliable as they are stylish.
                                At Ceylon Rider, we believe the best way to see Sri Lanka is with the wind in your hair and
                                the freedom to stop wherever the view takes your breath away. With our easy-to-use
                                digital booking system and a commitment to rider safety, we make exploring Paradise simple,
                                secure, and unforgettable.
                            </p>
                            <Quote className="w-8 h-8 text-[var(--primary)]/20 absolute -bottom-4 right-0" />
                        </div>
                    </div>

                    {/* Right: Compound Responsive Layout */}
                    <div className="grid grid-cols-2 gap-y-12 gap-x-6 md:gap-x-12">
                        {/* Contact Info - Full width on mobile, 1 col on desktop */}
                        <div className="col-span-2 md:col-span-1 space-y-6">
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

                        {/* Social Media - Side by side on mobile bottom, Top Right on desktop */}
                        <div className="col-span-1 md:col-span-1 space-y-6 order-3 md:order-2">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-white">Social Media</h3>
                            <div className="flex gap-4">
                                <a
                                    href="https://www.instagram.com/rydex.ceylon?igsh=N3QwYmdjeTk3aGtt&utm_source=qr"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-[var(--primary)] hover:border-[var(--primary)]/50 transition-all group"
                                >
                                    <Instagram className="w-5 h-5" />
                                </a>
                                <a
                                    href="https://www.tiktok.com/@rydex.ceylon?_r=1&_t=ZS-93ghB0Aw340"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-[var(--primary)] hover:border-[var(--primary)]/50 transition-all group"
                                >
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.9-.39-2.82-.12-1.11.33-2.1 1.12-2.58 2.16-.62 1.22-.64 2.72-.03 3.93.57 1.18 1.71 2.05 3.01 2.39 1.11.23 2.3.06 3.28-.53.77-.45 1.34-1.18 1.63-2.01.21-.6.28-1.24.27-1.87V0z" />
                                    </svg>
                                </a>
                            </div>
                        </div>

                        {/* Quick Links - Side by side on mobile bottom, Bottom Right on desktop */}
                        <div className="col-span-1 md:col-span-2 space-y-6 order-2 md:order-3">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-white">Quick Links</h3>
                            <ul className="flex flex-wrap gap-x-8 gap-y-2">
                                <li><Link href="/" className="text-sm text-white/40 hover:text-[var(--primary)] transition-colors">Home</Link></li>
                                <li><Link href="/track" className="text-sm text-white/40 hover:text-[var(--primary)] transition-colors">My Bookings</Link></li>
                                <li><Link href="/reviews" className="text-sm text-white/40 hover:text-[var(--primary)] transition-colors">Reviews</Link></li>
                                <li><Link href="/policy" className="text-sm text-white/40 hover:text-[var(--primary)] transition-colors">Notices</Link></li>
                            </ul>
                        </div>
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

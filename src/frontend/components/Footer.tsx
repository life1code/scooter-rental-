"use client";

import { Mail, MapPin, Phone, Quote, Instagram, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function Footer() {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <footer className="bg-[#0a0c0f] border-t border-white/5 pt-24 pb-12 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--primary)]/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
                    {/* Left: Brand & Description */}
                    <div className="space-y-12">
                        <Link href="/" className="inline-block group transition-transform hover:scale-105">
                            <img src="/logo.png" alt="Rydex Logo" className="h-14 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
                        </Link>
                        <div className="relative max-w-xl group">
                            <Quote className="w-10 h-10 text-[var(--primary)]/10 absolute -top-8 -left-6 -scale-x-100 transition-colors group-hover:text-[var(--primary)]/30" />
                            <p className="text-white/50 text-base md:text-lg leading-relaxed text-justify font-medium relative z-10 first-letter:text-2xl first-letter:font-bold first-letter:text-[var(--primary)]">
                                Welcome to Rydex, your premier destination for freedom on two wheels.
                                Based in the heart of the Southern Province, we specialize in providing
                                travelers with high-quality scooters and bikes that are as reliable as they are stylish.
                                At Ceylon Rider, we believe the best way to see Sri Lanka is with the wind in your hair and
                                the freedom to stop wherever the view takes your breath away. With our easy-to-use
                                digital booking system and a commitment to rider safety, we make exploring Paradise simple,
                                secure, and unforgettable.
                            </p>
                            <Quote className="w-10 h-10 text-[var(--primary)]/10 absolute -bottom-6 right-0 transition-colors group-hover:text-[var(--primary)]/30" />
                        </div>
                    </div>

                    {/* Right: Compound Responsive Layout */}
                    <div className="grid grid-cols-2 gap-y-16 gap-x-8 md:gap-x-16">
                        {/* Contact Info */}
                        <div className="col-span-2 md:col-span-1 space-y-8">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--primary)] mb-2">Contact Us</h3>
                            <ul className="space-y-6">
                                <li className="flex items-start gap-4 group cursor-pointer">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-[var(--primary)]/50 transition-all duration-300">
                                        <Phone className="w-5 h-5 text-[var(--primary)] group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider mb-1">Phone</p>
                                        <span className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">+94 76 785 6020</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4 group cursor-pointer">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-[var(--primary)]/50 transition-all duration-300">
                                        <Mail className="w-5 h-5 text-[var(--primary)] group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider mb-1">Email</p>
                                        <span className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">rydexpvtltd@gmail.com</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4 group cursor-pointer">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-[var(--primary)]/50 transition-all duration-300">
                                        <MapPin className="w-5 h-5 text-[var(--primary)] group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider mb-1">Address</p>
                                        <span className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">No. 64/1, Galketiya, Unawatuna, Galle.</span>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        {/* Social Media */}
                        <div className="col-span-1 md:col-span-1 space-y-8 order-3 md:order-2">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--primary)] mb-2">Social Media</h3>
                            <div className="flex gap-5">
                                <a
                                    href="https://www.instagram.com/rydex.ceylon?igsh=N3QwYmdjeTk3aGtt&utm_source=qr"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-500 hover:scale-110 hover:border-pink-500/50 hover:bg-gradient-to-tr hover:from-[#fdf497] hover:via-[#fd5949] hover:to-[#d6249f] group shadow-[0_0_20px_rgba(214,36,159,0)] hover:shadow-[0_0_30px_rgba(214,36,159,0.3)]"
                                    title="Instagram"
                                >
                                    <Instagram className="w-6 h-6 text-white/40 group-hover:text-white transition-colors" />
                                </a>
                                <a
                                    href="https://www.tiktok.com/@rydex.ceylon?_r=1&_t=ZS-93ghB0Aw340"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-500 hover:scale-110 hover:border-cyan-400/50 hover:bg-black group shadow-[0_0_20px_rgba(0,0,0,0)] hover:shadow-[0_0_30px_rgba(0,242,234,0.3),-10px_0_20px_rgba(255,0,80,0.3)] overflow-hidden relative"
                                    title="TikTok"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-tr from-[#00f2ea]/20 to-[#ff0050]/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white/40 group-hover:text-white transition-colors relative z-10">
                                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.9-.39-2.82-.12-1.11.33-2.1 1.12-2.58 2.16-.62 1.22-.64 2.72-.03 3.93.57 1.18 1.71 2.05 3.01 2.39 1.11.23 2.3.06 3.28-.53.77-.45 1.34-1.18 1.63-2.01.21-.6.28-1.24.27-1.87V0z" />
                                    </svg>
                                </a>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="col-span-1 md:col-span-2 space-y-8 order-2 md:order-3">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--primary)] mb-2">Quick Navigation</h3>
                            <ul className="flex flex-wrap gap-x-12 gap-y-4">
                                {['Home', 'My Bookings', 'Reviews', 'Notices'].map((item) => (
                                    <li key={item}>
                                        <Link
                                            href={item === 'Home' ? '/' : item === 'My Bookings' ? '/track' : `/${item.toLowerCase().replace(' ', '')}`}
                                            className="text-sm font-bold text-white/40 hover:text-[var(--primary)] transition-all flex items-center gap-1 group/link"
                                        >
                                            {item}
                                            <ArrowUpRight className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-all translate-y-1 group-hover/link:translate-y-0" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <p className="text-[10px] uppercase font-black tracking-[0.3em] text-white/20">
                            © 2026 Rydex All Rights Reserved.
                        </p>
                        <div className="h-px w-8 bg-white/10 hidden md:block" />
                        <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-white/10 italic">
                            Elevating your Sri Lankan Journey
                        </p>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="flex gap-8">
                            <Link href="/policy" className="text-[10px] uppercase font-black tracking-widest text-white/20 hover:text-[var(--primary)] transition-colors">Privacy</Link>
                            <Link href="/policy" className="text-[10px] uppercase font-black tracking-widest text-white/20 hover:text-[var(--primary)] transition-colors">Terms</Link>
                        </div>
                        <button
                            onClick={scrollToTop}
                            className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-[var(--primary)] transition-all group"
                        >
                            <ArrowUpRight className="w-5 h-5 text-white/20 group-hover:text-[var(--primary)] -rotate-45" />
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
}

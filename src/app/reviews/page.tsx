"use client";

import { signIn, useSession } from "next-auth/react";
import { Navbar } from "@/frontend/components/Navbar";
import { Star, Quote, ThumbsUp, MessageSquare, ChevronLeft, Search, X } from "lucide-react";
import React, { useState, useEffect } from "react";
import Link from "next/link";

const REVIEWS = []; // Logic moved to API

export default function ReviewsPage() {
    const { data: session } = useSession();
    const [reviews, setReviews] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [bikes, setBikes] = useState<any[]>([]);

    const [form, setForm] = useState({
        name: '',
        location: '',
        bike: '',
        rating: 5,
        content: '',
        avatar: ''
    });

    useEffect(() => {
        fetchReviews();
        fetchBikes();
    }, []);

    // Update form with session data when modal opens or session loads
    useEffect(() => {
        if (session?.user) {
            setForm(prev => ({
                ...prev,
                name: session.user?.name || prev.name,
                avatar: session.user?.image || prev.avatar
            }));
        }
    }, [session, isModalOpen]);

    async function fetchReviews() {
        try {
            const res = await fetch('/api/reviews');
            const data = await res.json();
            if (Array.isArray(data)) setReviews(data);
        } catch (error) {
            console.error(error);
        }
    }

    async function fetchBikes() {
        try {
            const res = await fetch('/api/scooters');
            const data = await res.json();
            setBikes(data);
        } catch (error) {
            console.error(error);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Ensure avatar is set from session if available at submit time
        const submissionData = {
            ...form,
            avatar: session?.user?.image || form.avatar
        };

        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                body: JSON.stringify(submissionData),
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.ok) {
                await fetchReviews();
                setIsModalOpen(false);
                setForm({ name: '', location: '', bike: '', rating: 5, content: '', avatar: '' });
                alert("Thanks for your review!");
            }
        } catch (error) {
            alert("Failed to submit review");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[var(--background)] pb-20">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 pt-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4">
                            <ChevronLeft className="w-4 h-4" />
                            <span>Back</span>
                        </Link>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">
                            Rider <span className="neon-text">Stories</span>
                        </h1>
                        <p className="text-white/60 text-lg md:text-xl font-medium max-w-xl">
                            Real feedback from our community of travelers and explorers.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <div className="glass-card p-6 text-center border-[var(--primary)]/20 shadow-[0_0_30px_rgba(45,212,191,0.1)]">
                            <p className="text-4xl font-bold mb-1">4.9</p>
                            <div className="flex items-center justify-center gap-1 text-[var(--secondary)] mb-2">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-current" />
                                ))}
                            </div>
                            <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Average Rating</p>
                        </div>
                        <div className="glass-card p-6 text-center border-white/5">
                            <p className="text-4xl font-bold mb-1">500+</p>
                            <div className="flex items-center justify-center gap-1 text-[var(--primary)] mb-2">
                                <ThumbsUp className="w-4 h-4" />
                            </div>
                            <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Happy Riders</p>
                        </div>
                    </div>
                </div>

                {/* Filters/Search */}
                <div className="flex flex-col md:flex-row items-center gap-4 mb-12">
                    <div className="flex-1 w-full flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10 focus-within:border-[var(--primary)]/50 transition-colors">
                        <Search className="w-5 h-5 text-white/20" />
                        <input type="text" placeholder="Search reviews or bikes..." className="bg-transparent border-none focus:outline-none w-full text-sm font-medium" />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                        <button className="px-5 py-2.5 rounded-xl bg-[var(--primary)] text-black font-bold text-xs whitespace-nowrap">All Reviews</button>
                        <button className="px-5 py-2.5 rounded-xl bg-white/5 text-white/60 font-bold text-xs hover:bg-white/10 transition-colors whitespace-nowrap">Highest Rated</button>
                    </div>
                </div>

                {/* Reviews Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {reviews.map((review) => (
                        <div key={review.id} className="glass-card p-8 space-y-6 flex flex-col group hover:border-[var(--primary)]/30 transition-all duration-300">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-[var(--primary)]/50 transition-colors">
                                        <img src={review.avatar} alt={review.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{review.name}</h3>
                                        <p className="text-xs text-secondary font-medium uppercase tracking-wider">{review.location}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center justify-end gap-1 text-[var(--secondary)] font-bold">
                                        <Star className="w-3 h-3 fill-current" />
                                        <span className="text-sm">{review.rating}.0</span>
                                    </div>
                                    <p className="text-[10px] text-white/40 mt-1 font-bold italic">{review.date}</p>
                                </div>
                            </div>

                            <div className="flex-1 relative">
                                <Quote className="w-8 h-8 text-[var(--primary)]/10 absolute -top-4 -left-2" />
                                <p className="text-white/70 leading-relaxed relative z-10 italic">
                                    "{review.content}"
                                </p>
                            </div>

                            <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                                    <MessageSquare className="w-3 h-3 text-[var(--primary)]" />
                                    <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{review.bike}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {reviews.length === 0 && (
                        <div className="col-span-full py-20 text-center text-white/40">
                            No reviews yet. Be the first!
                        </div>
                    )}
                </div>

                {/* CTA */}
                <div className="mt-20 glass-card p-12 text-center border-[var(--primary)]/20 relative overflow-hidden">
                    <div className="relative z-10 space-y-6">
                        <h2 className="text-3xl font-bold">Rented with us before?</h2>
                        <p className="text-white/60 max-w-lg mx-auto">Your feedback helps our community of riders find the perfect ride for their adventure.</p>
                        <button onClick={() => setIsModalOpen(true)} className="btn-primary">Leave a Review</button>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary)]/5 blur-[120px] rounded-full -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--secondary)]/5 blur-[120px] rounded-full -ml-32 -mb-32"></div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="glass-card max-w-lg w-full p-8 relative z-10 animate-in zoom-in-95">
                        <h2 className="text-3xl font-bold mb-6">Write a Review</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Avatar Preview */}
                            {form.avatar && (
                                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[var(--primary)]">
                                        <img src={form.avatar} alt="Profile" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">Posting as</p>
                                        <p className="text-xs text-white/60">{form.name}</p>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold uppercase text-white/60 mb-2">Your Name</label>
                                <input
                                    required
                                    type="text"
                                    className={`w-full bg-white/5 border border-white/10 rounded-xl p-4 text-base ${session?.user ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    value={form.name}
                                    onChange={e => !session?.user && setForm({ ...form, name: e.target.value })}
                                    readOnly={!!session?.user}
                                    placeholder="John Doe"
                                />
                                {session?.user && <p className="text-[10px] text-white/40 mt-1">Linked to your Google account</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold uppercase text-white/60 mb-2">Location</label>
                                <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-base"
                                    value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Germany" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold uppercase text-white/60 mb-2">Which Bike?</label>
                                <select className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-lg font-medium"
                                    value={form.bike} onChange={e => setForm({ ...form, bike: e.target.value })}>
                                    <option value="">Select a bike...</option>
                                    {bikes.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                                    <option value="General">General Service</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold uppercase text-white/60 mb-2">Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button key={star} type="button" onClick={() => setForm({ ...form, rating: star })}>
                                            <Star className={`w-8 h-8 ${form.rating >= star ? 'fill-[var(--primary)] text-[var(--primary)]' : 'text-white/20'}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold uppercase text-white/60 mb-2">Review</label>
                                <textarea required className="w-full bg-white/5 border border-white/10 rounded-xl p-4 h-32 text-base"
                                    value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Tell us about your experience..." />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 btn-secondary">Cancel</button>
                                <button type="submit" disabled={isLoading} className="flex-1 btn-primary">
                                    {isLoading ? 'Posting...' : 'Submit Review'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}

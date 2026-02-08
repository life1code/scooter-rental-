"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Navbar } from "@/frontend/components/Navbar";
import {
    ArrowLeft,
    Upload,
    Check,
    Bike,
    DollarSign,
    Info,
    Gauge,
    Zap,
    Fuel,
    Save
} from "lucide-react";
import Link from "next/link";
import { compressImage, safeSaveToLocalStorage } from "@/backend/lib/image-utils";

export default function AddScooter() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const { data: session, status } = useSession();

    // Initial check for session and role
    useEffect(() => {
        if (status === "loading") return;

        if (status === "unauthenticated") {
            router.push("/admin/login");
            return;
        }

        const userRole = (session?.user as any)?.role;
        if (userRole !== "admin" && userRole !== "host" && userRole !== "superadmin") {
            router.push("/admin/login");
            return;
        }

        const approvalStatus = (session?.user as any)?.approvalStatus;
        if (userRole === "host" && approvalStatus !== "approved") {
            router.push("/admin");
            return;
        }
    }, [status, session, router]);

    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result as string;
                const compressed = await compressImage(base64);
                setImagePreview(compressed);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Get form data
            const formData = new FormData(e.target as HTMLFormElement);
            const name = formData.get('name') as string;
            const model = formData.get('model') as string || name;
            const price = formData.get('price') as string;

            const scooterData = {
                name: name,
                model: model,
                type: formData.get('type') || 'Scooter',
                pricePerDay: parseFloat(price),
                image: imagePreview || (formData.get('imageUrl') as string) || "/images/spotlight/honda-pcx.jpeg",
                rating: parseFloat(formData.get('rating') as string) || 5.0,
                status: 'Available',
                description: "Premium scooter added by host.",
                specs: {
                    engine: formData.get('engine') || "125cc",
                    transmission: formData.get('transmission') || "Automatic",
                    speed: formData.get('speed') || "100 km/h",
                    fuel: formData.get('fuel') || "Petrol"
                },
                isSpotlight: formData.get('isSpotlight') === 'on',
                manufacturerUrl: formData.get('manufacturerUrl') as string || "",
                location: formData.get('location') as string || "Unawatuna",
                ownerName: formData.get('ownerName') as string || "Ride Owner",
                ownerWhatsapp: formData.get('ownerWhatsapp') as string || "+94700000000"
            };

            const response = await fetch('/api/scooters', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(scooterData),
            });

            if (!response.ok) {
                throw new Error('Failed to save scooter');
            }

            setIsLoading(false);
            setIsSuccess(true);
            setTimeout(() => {
                router.push("/admin/fleet");
            }, 1500);
        } catch (error) {
            console.error("Error saving scooter:", error);
            alert("Failed to save scooter to database. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen pb-20">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 pt-12">
                <Link href="/admin" className="inline-flex items-center gap-2 text-white/40 hover:text-[var(--primary)] transition-colors mb-8 group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-bold uppercase tracking-widest">Back to Dashboard</span>
                </Link>

                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight">Add New <span className="text-[var(--primary)]">Scooter</span></h1>
                        <p className="text-white/40">Enter the details of your new fleet addition.</p>
                    </div>
                </div>

                {isSuccess ? (
                    <div className="glass-card p-20 text-center animate-in zoom-in-95 duration-500">
                        <div className="w-20 h-20 bg-[var(--primary)]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check className="w-10 h-10 text-[var(--primary)]" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Scooter Added Successfully!</h2>
                        <p className="text-white/40 max-w-xs mx-auto">Your new ride will be visible on the home page shortly. Redirecting...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Basic Info Section */}
                        <div className="glass-card p-8 space-y-6">
                            <div className="flex items-center gap-2 mb-2">
                                <Info className="w-4 h-4 text-[var(--primary)]" />
                                <h3 className="text-sm font-bold uppercase tracking-widest">General Information</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase text-white/40 font-bold ml-1">Scooter Display Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="e.g. Honda PCX 160cc - White"
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--primary)] transition-all"
                                    />
                                    <p className="text-[9px] text-white/20 italic ml-1">The title shown to customers on the card.</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase text-white/40 font-bold ml-1">Category / Type</label>
                                    <select name="type" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--primary)] transition-all appearance-none">
                                        <option value="Scooter">Scooter</option>
                                        <option value="Motorbike">Motorbike</option>
                                        <option value="Electric">Electric</option>
                                        <option value="Premium">Premium</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase text-white/40 font-bold ml-1">Operating Location</label>
                                    <select
                                        name="location"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--primary)] transition-all appearance-none"
                                        defaultValue="Unawatuna"
                                    >
                                        <option value="Unawatuna">Unawatuna</option>
                                        <option value="Weligama">Weligama</option>
                                        <option value="Mirissa">Mirissa</option>
                                        <option value="Ahangama">Ahangama</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase text-white/40 font-bold ml-1">Rent Price per Day ($)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                        <input
                                            type="number"
                                            name="price"
                                            placeholder="12.00"
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[var(--primary)] transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase text-white/40 font-bold ml-1">Initial Rating</label>
                                    <input
                                        type="number"
                                        name="rating"
                                        step="0.1"
                                        max="5"
                                        placeholder="4.9"
                                        defaultValue="4.9"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--primary)] transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase text-white/40 font-bold ml-1">Scooter Model (Filter Keyword)</label>
                                    <input
                                        type="text"
                                        name="model"
                                        placeholder="e.g. PCX, NMAX, Dio"
                                        required
                                        className="w-full bg-[var(--primary)]/5 border border-[var(--primary)]/20 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--primary)] transition-all font-bold"
                                    />
                                    <p className="text-[9px] text-[var(--primary)] italic ml-1 font-bold">This MUST match the search dropdown perfectly.</p>
                                </div>
                            </div>
                        </div>

                        {/* Technical Specs */}
                        <div className="glass-card p-8 space-y-6">
                            <div className="flex items-center gap-2 mb-2">
                                <Zap className="w-4 h-4 text-[var(--secondary)]" />
                                <h3 className="text-sm font-bold uppercase tracking-widest">Technical Specifications</h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase text-white/40 font-bold ml-1 flex items-center gap-1">
                                        <Gauge className="w-3 h-3" /> Engine (cc)
                                    </label>
                                    <input
                                        type="text"
                                        name="engine"
                                        placeholder="160cc"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--primary)] transition-all text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase text-white/40 font-bold ml-1 flex items-center gap-1">
                                        <Info className="w-3 h-3" /> Transmission
                                    </label>
                                    <input
                                        type="text"
                                        name="transmission"
                                        placeholder="Automatic"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--primary)] transition-all text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase text-white/40 font-bold ml-1 flex items-center gap-1 text-red-400">
                                        <Zap className="w-3 h-3" /> Max Speed
                                    </label>
                                    <input
                                        type="text"
                                        name="speed"
                                        placeholder="110 km/h"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--primary)] transition-all text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase text-white/40 font-bold ml-1 flex items-center gap-1 text-orange-400">
                                        <Fuel className="w-3 h-3" /> Fuel Type
                                    </label>
                                    <input
                                        type="text"
                                        name="fuel"
                                        placeholder="Petrol"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--primary)] transition-all text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Media Section */}
                        <div className="glass-card p-8 space-y-6">
                            <div className="flex items-center gap-2 mb-2">
                                <Upload className="w-4 h-4 text-blue-400" />
                                <h3 className="text-sm font-bold uppercase tracking-widest">Media & Gallery</h3>
                            </div>

                            <div className="space-y-4">
                                <label className="block w-full border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-[var(--primary)]/30 transition-colors group cursor-pointer relative overflow-hidden">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                    {imagePreview ? (
                                        <div className="absolute inset-0">
                                            <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Upload className="w-8 h-8 text-white" />
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="w-10 h-10 text-white/20 mx-auto mb-4 group-hover:text-[var(--primary)] transition-colors" />
                                            <p className="text-sm font-bold text-white/60 mb-1">Click to upload scooter image</p>
                                            <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold">PNG, JPG or WEBP (Max 2MB)</p>
                                        </>
                                    )}
                                </label>
                            </div>

                            <div className="space-y-2 pt-4">
                                <label className="text-[10px] uppercase text-white/40 font-bold ml-1">Or direct image URL</label>
                                <input
                                    type="text"
                                    name="imageUrl"
                                    placeholder="https://example.com/scooter.png"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--primary)] transition-all"
                                />
                            </div>
                        </div>

                        {/* Spotlight Section */}
                        <div className="glass-card p-8 space-y-6 border-[var(--primary)]/10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-[var(--primary)]" />
                                    <h3 className="text-sm font-bold uppercase tracking-widest">Homepage Spotlight</h3>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" name="isSpotlight" className="sr-only peer" />
                                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
                                </label>
                            </div>

                            <p className="text-xs text-white/40">Enable this to feature this scooter in the "Manufacturer Spotlight" section on the homepage.</p>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase text-white/40 font-bold ml-1">Manufacturer Product URL</label>
                                <input
                                    type="url"
                                    name="manufacturerUrl"
                                    placeholder="https://www.honda2wheelersindia.com/..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--primary)] transition-all"
                                />
                                <p className="text-[10px] text-white/20">The external link where users can see official technical specifications.</p>
                            </div>
                        </div>

                        {/* Owner Details Section */}
                        <div className="glass-card p-8 space-y-6">
                            <div className="flex items-center gap-2 mb-2">
                                <Info className="w-4 h-4 text-[var(--primary)]" />
                                <h3 className="text-sm font-bold uppercase tracking-widest">Owner Information</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase text-white/40 font-bold ml-1">Scooter Owner Name</label>
                                    <input
                                        type="text"
                                        name="ownerName"
                                        placeholder="e.g. John Doe"
                                        defaultValue="Ride Owner"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--primary)] transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase text-white/40 font-bold ml-1">Owner WhatsApp Number</label>
                                    <input
                                        type="text"
                                        name="ownerWhatsapp"
                                        placeholder="+94 7X XXX XXXX"
                                        defaultValue="+94700000000"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[var(--primary)] transition-all"
                                    />
                                    <p className="text-[9px] text-white/20 italic">Format: +94XXXXXXXXX (Include country code)</p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 btn-primary !py-4 flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(45,212,191,0.2)] disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        <span className="font-bold">Save Scooter to Fleet</span>
                                    </>
                                )}
                            </button>
                            <Link href="/admin" className="btn-secondary !py-4 px-8 text-center font-bold">Cancel</Link>
                        </div>
                    </form>
                )}
            </div>
        </main>
    );
}

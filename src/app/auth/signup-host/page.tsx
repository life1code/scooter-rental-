"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/frontend/components/Navbar";
import { Building2, MapPin, CreditCard, Phone, Mail, User, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function HostSignup() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        institutionName: "",
        institutionAddress: "",
        nicNumber: "",
        phoneNumber: "",
        nicPhoto: ""
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, nicPhoto: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");

        try {
            const res = await fetch("/api/auth/register-host", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
            } else {
                setError(data.error || "Failed to register host");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-6">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass-card p-10 max-w-md w-full text-center space-y-6"
                >
                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-3xl font-bold">Registration Received!</h2>
                    <p className="text-white/60">
                        Thank you for applying to be a host. Your request for <span className="text-white font-bold">{formData.institutionName}</span> has been forwarded to the Super Admin.
                    </p>
                    <div className="p-4 bg-white/5 rounded-xl text-xs text-white/40 italic">
                        Once approved, you will receive an email and be able to log in to your host dashboard.
                    </div>
                    <button
                        onClick={() => router.push("/auth/signin")}
                        className="btn-primary w-full"
                    >
                        Back to Login
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[var(--background)] pb-20">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 pt-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold tracking-tight mb-4">Start Hosting on <span className="text-[var(--primary)]">Ride</span></h1>
                    <p className="text-white/40">Register your institution and start managing your fleet today.</p>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Personal Information */}
                    <div className="glass-card p-8 space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <User className="w-5 h-5 text-[var(--primary)]" />
                            <h2 className="text-xl font-bold">Personal Information</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Full Name</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--primary)] transition-colors"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Email Address</label>
                                <input
                                    required
                                    type="email"
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--primary)] transition-colors"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Phone Number</label>
                                <input
                                    required
                                    type="tel"
                                    placeholder="+94 7X XXX XXXX"
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--primary)] transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Institutional Information */}
                    <div className="glass-card p-8 space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Building2 className="w-5 h-5 text-[var(--primary)]" />
                            <h2 className="text-xl font-bold">Institutional Information</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Institution Name</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Rydex Pvt Ltd"
                                    value={formData.institutionName}
                                    onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--primary)] transition-colors"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Institution Address</label>
                                <textarea
                                    required
                                    placeholder="Full business address"
                                    value={formData.institutionAddress}
                                    onChange={(e) => setFormData({ ...formData, institutionAddress: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--primary)] transition-colors min-h-[100px]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Verification Documents */}
                    <div className="md:col-span-2 glass-card p-8 space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <CreditCard className="w-5 h-5 text-[var(--primary)]" />
                            <h2 className="text-xl font-bold">Identity Verification</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">NIC Number</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Enter NIC number"
                                        value={formData.nicNumber}
                                        onChange={(e) => setFormData({ ...formData, nicNumber: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--primary)] transition-colors"
                                    />
                                </div>
                                <div className="p-4 bg-[var(--primary)]/5 border border-[var(--primary)]/10 rounded-xl">
                                    <p className="text-xs text-[var(--primary)] flex gap-2">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        Your details will be manually verified by our super administrators before your account is activated.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">NIC Photo (Front)</label>
                                <div className="relative group cursor-pointer h-full min-h-[150px]">
                                    {formData.nicPhoto ? (
                                        <div className="relative h-full w-full rounded-xl overflow-hidden border border-white/10">
                                            <img src={formData.nicPhoto} alt="NIC Preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, nicPhoto: "" })}
                                                className="absolute top-2 right-2 bg-black/60 p-2 rounded-lg text-white hover:bg-red-500 transition-colors"
                                            >
                                                <Upload className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="h-full w-full rounded-xl border-2 border-dashed border-white/10 group-hover:border-[var(--primary)]/40 transition-colors flex flex-col items-center justify-center p-6 text-center">
                                            <Upload className="w-8 h-8 text-white/20 mb-2 group-hover:text-[var(--primary)] transition-colors" />
                                            <p className="text-sm font-bold text-white/40 group-hover:text-white transition-colors">Click to upload NIC Photo</p>
                                            <p className="text-[10px] text-white/20 uppercase tracking-widest mt-1">PNG, JPG or WEBP</p>
                                            <input
                                                required
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="md:col-span-2 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-medium flex gap-3"
                            >
                                <AlertCircle className="w-5 h-5" />
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="md:col-span-2 flex justify-end pt-4">
                        <button
                            disabled={submitting}
                            type="submit"
                            className="btn-primary w-full md:w-auto min-w-[200px] flex items-center justify-center gap-3"
                        >
                            {submitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                                    Submitting...
                                </>
                            ) : "Create Host Account"}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}

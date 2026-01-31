"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Chrome, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function SignIn() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "authenticated") {
            router.push("/");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary)]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--background)]">
            <div className="w-full max-w-md space-y-8 glass-card p-10 text-center">
                <div className="flex flex-col items-center">
                    <img src="/logo.png" alt="Ride Logo" className="h-24 w-auto object-contain mb-4" />
                    <p className="text-white/60">Your journey starts here.</p>
                </div>

                <div className="space-y-4">
                    <p className="text-sm text-white/40 uppercase tracking-widest font-medium">
                        Sign in to continue
                    </p>

                    <button
                        onClick={() => signIn("google")}
                        className="w-full flex items-center justify-center gap-3 bg-white text-black font-semibold py-4 px-6 rounded-2xl transition-all hover:bg-white/90 active:scale-[0.98]"
                    >
                        <Chrome className="w-6 h-6" />
                        Continue with Google
                    </button>

                    <div className="pt-4 border-t border-white/5">
                        <p className="text-[10px] text-white/20 uppercase font-bold mb-3 tracking-widest">Business Administration</p>
                        <Link
                            href="/admin/login"
                            className="w-full py-4 rounded-2xl border border-white/10 text-white/60 text-xs font-bold hover:bg-white/5 hover:text-white transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                            <ShieldCheck className="w-4 h-4" />
                            Host Account Login
                        </Link>
                    </div>
                </div>

                <div className="text-xs text-white/30 pt-4">
                    By signing in, you agree to our Terms of Service and Privacy Policy.
                </div>
            </div>

            <div className="mt-12 text-white/20 text-sm">
                Premium Scooter Rental Shop
            </div>
        </div>
    );
}

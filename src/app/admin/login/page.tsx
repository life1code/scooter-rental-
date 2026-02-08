"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { Lock, ShieldCheck, LogOut, AlertTriangle, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/frontend/components/ToastProvider";

export default function AdminLogin() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { showToast } = useToast();

    // Show loading state while checking
    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-[var(--primary)] animate-spin" />
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Verifying Session...</p>
                </div>
            </div>
        );
    }


    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            const userRole = (session.user as any)?.role;
            const hasAccess = userRole === "admin" || userRole === "host" || userRole === "superadmin";

            if (hasAccess) {
                router.push("/admin");
            } else {
                // We'll show the access denied message in the UI instead of immediate redirect
                console.log("Authenticated but no admin/host role. Showing registration option.");
            }
        }
    }, [status, session, router]);

    const handleGoogleSignIn = () => {
        signIn("google", { callbackUrl: "/admin" });
    };

    const userRole = (session?.user as any)?.role;
    const hasAccess = userRole === "admin" || userRole === "host" || userRole === "superadmin";
    const isStandardUser = status === "authenticated" && !hasAccess;

    if (status === "authenticated" && session?.user && !hasAccess) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--background)]">
                <div className="w-full max-w-md space-y-8 glass-card p-10 text-center relative overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl"></div>

                    <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight mb-2">Access Denied</h1>
                    <p className="text-white/60 text-sm mb-8">
                        The account <span className="text-white font-bold">{session.user.email}</span> does not have host or admin privileges.
                    </p>

                    <div className="space-y-3">
                        <Link
                            href="/auth/signup-host"
                            className="w-full bg-[var(--primary)] text-black font-bold py-4 px-6 rounded-2xl hover:bg-[var(--primary)]/90 transition-all flex items-center justify-center gap-2"
                        >
                            <ShieldCheck className="w-5 h-5" />
                            Register as a Host
                        </Link>

                        <button
                            onClick={() => signOut({ callbackUrl: "/admin/login" })}
                            className="w-full bg-white/5 text-white/60 font-medium py-4 px-6 rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                        >
                            <LogOut className="w-5 h-5" />
                            Sign Out / Switch Account
                        </button>
                    </div>

                    <div className="pt-8 mt-8 border-t border-white/5">
                        <Link href="/" className="text-xs text-[var(--primary)] hover:underline font-bold uppercase tracking-widest">
                            Return to Homepage
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--background)]">
            <div className="w-full max-w-md space-y-8 glass-card p-10 relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-[var(--primary)]/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[var(--secondary)]/10 rounded-full blur-3xl"></div>

                <div className="text-center relative">
                    <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[var(--primary)]/20 shadow-[0_0_20px_rgba(45,212,191,0.1)]">
                        <Lock className="w-8 h-8 text-[var(--primary)]" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Host <span className="text-[var(--primary)]">Login</span></h1>
                    <p className="text-white/40 text-sm">Restricted access for authorized administrators only.</p>
                </div>

                <div className="space-y-4 relative">
                    <button
                        onClick={handleGoogleSignIn}
                        className="w-full bg-white text-black font-bold py-4 px-6 rounded-2xl hover:bg-white/90 transition-all flex items-center justify-center gap-3 shadow-lg"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span>Sign in with Google</span>
                    </button>

                    {status === "unauthenticated" && (
                        <p className="text-xs text-white/40 text-center px-4">
                            Only authorized admin accounts can access this dashboard.
                        </p>
                    )}
                </div>

                <div className="pt-8 mt-8 border-t border-white/5 text-center">
                    <div className="flex items-center justify-center gap-2 text-white/20 text-[10px] font-bold uppercase tracking-widest">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Secured OAuth Authentication</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

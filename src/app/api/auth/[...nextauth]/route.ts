import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
    ],
    pages: {
        signIn: '/auth/signin',
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            // Define allowed admin emails
            const ADMIN_EMAILS = ['rydexpvtltd@gmail.com', 'smilylife996cha@gmail.com'];

            // Restrict access to admin emails only
            if (user.email && !ADMIN_EMAILS.includes(user.email)) {
                return false; // Deny access
            }

            // Auto-create user in database if they don't exist
            if (account?.provider === "google" && user.email) {
                const { prisma } = await import("@/backend/lib/db");
                await prisma.user.upsert({
                    where: { email: user.email },
                    update: {
                        name: user.name || undefined,
                    },
                    create: {
                        id: user.id,
                        email: user.email,
                        name: user.name || null,
                        role: "admin", // Mark as admin
                    },
                });
            }
            return true;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.sub;
            }
            return session;
        },
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

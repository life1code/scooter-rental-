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

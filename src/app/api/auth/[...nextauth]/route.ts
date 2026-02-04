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

            // Auto-create user in database if they don't exist
            if (account?.provider === "google" && user.email) {
                const { prisma } = await import("@/backend/lib/db");

                // Check if user is an admin based on email
                const isAdmin = ADMIN_EMAILS.includes(user.email);

                console.log(`Attempting to upsert user: ${user.email} with ID: ${user.id}`);

                try {
                    await prisma.user.upsert({
                        where: { email: user.email },
                        update: {
                            name: user.name || undefined,
                            // Don't downgrade existing admins, but upgrade new matches
                            ...(isAdmin ? { role: "admin" } : {})
                        },
                        create: {
                            id: user.id,
                            email: user.email,
                            name: user.name || null,
                            role: isAdmin ? "admin" : "user",
                        },
                    });
                    console.log(`Successfully upserted user: ${user.email}`);
                } catch (error) {
                    console.error(`Failed to upsert user ${user.email}:`, error);
                }
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

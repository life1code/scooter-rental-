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
            const SUPER_ADMIN_EMAILS = ['rydexpvtltd@gmail.com', 'smilylife996cha@gmail.com'];

            if (account?.provider === "google" && user.email) {
                const { prisma } = await import("@/backend/lib/db");

                // Get user from DB
                const dbUser = await prisma.user.findUnique({
                    where: { email: user.email }
                });

                const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(user.email);

                // If specialized super admin email but doesn't exist in DB yet
                if (isSuperAdmin && !dbUser) {
                    await prisma.user.create({
                        data: {
                            id: user.id,
                            email: user.email,
                            name: user.name || null,
                            role: "superadmin",
                            approvalStatus: "approved"
                        }
                    });
                    return true;
                }

                // If user doesn't exist at all, create as standard user
                if (!dbUser) {
                    await prisma.user.create({
                        data: {
                            id: user.id,
                            email: user.email,
                            name: user.name || null,
                            role: "user",
                            approvalStatus: "approved"
                        }
                    });
                    return true;
                }

                // If user is a host, check approval status but allow login (we will handle restriction in UI)
                // if (dbUser.role === "host" && dbUser.approvalStatus !== "approved") {
                //      throw new Error("Your host account is pending approval by a super admin.");
                // }

                // Auto-upgrade super admins if email matches but role isn't set
                if (isSuperAdmin && dbUser.role !== "superadmin") {
                    await prisma.user.update({
                        where: { email: user.email },
                        data: { role: "superadmin" }
                    });
                }

                return true;
            }
            return true;
        },
        async session({ session, token }) {
            if (session.user) {
                const { prisma } = await import("@/backend/lib/db");
                const dbUser = await prisma.user.findUnique({
                    where: { email: session.user.email! },
                    select: { id: true, role: true, institutionName: true }
                });

                if (dbUser) {
                    (session.user as any).id = dbUser.id;
                    (session.user as any).role = dbUser.role;
                    (session.user as any).approvalStatus = (dbUser as any).approvalStatus;
                    (session.user as any).institutionName = dbUser.institutionName;
                }
            }
            return session;
        },
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

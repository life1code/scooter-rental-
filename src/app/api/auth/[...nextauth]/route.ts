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
                console.log("🔐 [NextAuth] Attempting Google Sign-in for:", user.email);
                const { prisma } = await import("@/backend/lib/db");

                const dbUser = await prisma.user.findUnique({
                    where: { email: user.email },
                    select: { id: true, role: true }
                });

                console.log("🔐 [NextAuth] Found existing user in DB:", dbUser ? `Role: ${dbUser.role}` : "None (New User)");

                const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(user.email);

                // If specialized super admin email but doesn't exist in DB yet
                if (isSuperAdmin && !dbUser) {
                    console.log("🔐 [NextAuth] Auto-creating Super Admin for:", user.email);
                    await prisma.user.create({
                        data: {
                            id: user.id,
                            email: user.email,
                            name: user.name || null,
                            role: "superadmin"
                        }
                    });
                    return true;
                }

                // If user doesn't exist at all, create as standard user
                if (!dbUser) {
                    console.log("🔐 [NextAuth] Auto-creating Standard User for:", user.email);
                    await prisma.user.create({
                        data: {
                            id: user.id,
                            email: user.email,
                            name: user.name || null,
                            role: "user"
                        }
                    });
                    return true;
                }

                // Auto-upgrade super admins if email matches but role isn't set
                if (isSuperAdmin && dbUser.role !== "superadmin") {
                    console.log("🔐 [NextAuth] Upgrading to Super Admin:", user.email);
                    await prisma.user.update({
                        where: { email: user.email },
                        data: { role: "superadmin" },
                        select: { id: true, role: true }
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
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        hostProfile: {
                            select: {
                                institutionName: true,
                                approvalStatus: true
                            }
                        }
                    }
                });

                if (dbUser) {
                    console.log(`🔐 [NextAuth] Session logic for ${dbUser.email}: Role=${dbUser.role}, Approved=${dbUser.hostProfile?.approvalStatus}`);
                    (session.user as any).id = dbUser.id;
                    (session.user as any).role = dbUser.role;
                    if (dbUser.hostProfile) {
                        (session.user as any).approvalStatus = dbUser.hostProfile.approvalStatus;
                        (session.user as any).institutionName = dbUser.hostProfile.institutionName;
                    }
                } else {
                    console.log(`🔐 [NextAuth] Session logic: User ${session.user.email} not found in DB`);
                }
            }
            return session;
        },
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

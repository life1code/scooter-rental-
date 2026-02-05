import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import pool from "@/backend/lib/rds";

export async function PATCH(request: Request) {
    let client;
    try {
        const session = await getServerSession(authOptions);
        const ADMIN_EMAILS = ['rydexpvtltd@gmail.com', 'smilylife996cha@gmail.com'];
        const isAdmin = session?.user?.email && ADMIN_EMAILS.includes(session.user.email);

        if (!isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { orders } = await request.json(); // Array of { id: string, order: number }

        if (!Array.isArray(orders)) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        client = await pool.connect();
        await client.query('BEGIN');

        for (const item of orders) {
            await client.query(
                'UPDATE "Scooter" SET display_order = $1 WHERE id = $2',
                [item.order, item.id]
            );
        }

        await client.query('COMMIT');

        return NextResponse.json({ success: true });
    } catch (error: any) {
        if (client) await client.query('ROLLBACK');
        console.error("Error reordering scooters (Raw SQL):", error);
        return NextResponse.json({ error: "Failed to reorder scooters", details: error.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}

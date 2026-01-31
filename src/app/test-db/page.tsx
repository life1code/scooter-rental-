"use client";

import { useEffect, useState } from "react";

export default function TestDBPage() {
    const [status, setStatus] = useState("Loading...");
    const [bookings, setBookings] = useState<any>(null);
    const [scooters, setScooters] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function checkDB() {
            try {
                // Check Bookings
                const bookingsRes = await fetch('/api/bookings');
                const bookingsData = await bookingsRes.json();
                setBookings(bookingsData);

                // Check Scooters (via seed count or direct fetch)
                // We'll fetch from seed just to see count
                const seedRes = await fetch('/api/seed');
                const seedData = await seedRes.json();
                setScooters(seedData);

                setStatus("Checks Complete");
            } catch (err: any) {
                console.error(err);
                setError(err.message);
                setStatus("Failed");
            }
        }

        checkDB();
    }, []);

    return (
        <div className="p-8 font-mono text-white bg-black min-h-screen">
            <h1 className="text-2xl font-bold text-green-500 mb-4">Database Diagnostics</h1>

            <div className="space-y-6">
                <div className="border border-white/20 p-4 rounded">
                    <h2 className="text-xl font-bold mb-2">Status: {status}</h2>
                    {error && <p className="text-red-500 font-bold">Error: {error}</p>}
                </div>

                <div className="border border-white/20 p-4 rounded">
                    <h2 className="text-xl font-bold mb-2 text-blue-400">Bookings (Count: {Array.isArray(bookings) ? bookings.length : '?'})</h2>
                    <pre className="text-xs overflow-auto max-h-60 bg-white/5 p-2">
                        {JSON.stringify(bookings, null, 2)}
                    </pre>
                </div>

                <div className="border border-white/20 p-4 rounded">
                    <h2 className="text-xl font-bold mb-2 text-yellow-400">Scooters (Seed Result)</h2>
                    <pre className="text-xs overflow-auto max-h-60 bg-white/5 p-2">
                        {JSON.stringify(scooters, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
}

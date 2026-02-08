"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Dynamically import Leaflet components with ssr: false
const MapContainer = dynamic(
    () => import('react-leaflet').then((mod) => mod.MapContainer),
    { ssr: false }
);
const TileLayer = dynamic(
    () => import('react-leaflet').then((mod) => mod.TileLayer),
    { ssr: false }
);
const Marker = dynamic(
    () => import('react-leaflet').then((mod) => mod.Marker),
    { ssr: false }
);
const Popup = dynamic(
    () => import('react-leaflet').then((mod) => mod.Popup),
    { ssr: false }
);

interface TrackingMapProps {
    activeBookings: any[];
    allScooters: any[];
}

export default function TrackingMap({ activeBookings, allScooters }: TrackingMapProps) {
    const [L, setL] = useState<any>(null);

    useEffect(() => {
        // Import leaflet only on client side
        import('leaflet').then((leaflet) => {
            setL(leaflet.default);
        });
    }, []);

    if (!L) {
        return (
            <div className="w-full h-[400px] flex items-center justify-center bg-white/5 rounded-2xl border border-white/10">
                <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const getIcon = (status: string) => {
        const color = status === 'Active' ? 'blue' : status === 'Available' ? 'green' : 'orange';
        return L.icon({
            iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
        });
    };

    // Combine active bookings with GPS and scooters with GPS
    const activeWithGPS = activeBookings.filter(b => b.lastLat && b.lastLng);
    const scootersWithGPS = allScooters.filter(s => s.lastLat && s.lastLng && !activeWithGPS.find(b => b.scooterId === s.id));

    return (
        <div className="w-full h-[400px] rounded-2xl overflow-hidden border border-white/10 relative z-10">
            <style>{`
                .leaflet-container { background: #0a0c0f !important; }
                .leaflet-tile { filter: grayscale(1) invert(1) opacity(0.2); }
            `}</style>
            <MapContainer center={[6.0022, 80.2484]} zoom={13} className="w-full h-full">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {/* Active Rentals (Blue) */}
                {activeWithGPS.map((booking) => (
                    <Marker key={booking.id} position={[booking.lastLat, booking.lastLng]} icon={getIcon('Active')}>
                        <Popup>
                            <div className="text-black min-w-[120px]">
                                <p className="font-bold border-b pb-1 mb-1">{booking.riderName}</p>
                                <p className="text-xs text-blue-600 font-bold uppercase">{booking.scooter?.name}</p>
                                <p className="text-[10px] text-gray-500 italic">Currently Rented</p>
                                <div className="mt-2 text-[10px] flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                    Live tracking active
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Available Scooters (Green) */}
                {scootersWithGPS.map((scooter) => (
                    <Marker key={scooter.id} position={[scooter.lastLat, scooter.lastLng]} icon={getIcon('Available')}>
                        <Popup>
                            <div className="text-black min-w-[120px]">
                                <p className="font-bold border-b pb-1 mb-1">{scooter.name}</p>
                                <p className="text-xs text-green-600 font-bold uppercase">{scooter.status}</p>
                                <p className="text-[10px] text-gray-500">Available for rent</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}

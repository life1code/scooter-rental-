"use client";

import { Scooter } from "@/backend/data/scooters";
import { Star, MapPin, Zap } from "lucide-react";
import Link from "next/link";

interface ScooterCardProps {
    scooter: Scooter;
}

export function ScooterCard({ scooter }: ScooterCardProps) {
    return (
        <Link href={`/scooters/${scooter.id}`}>
            <div className="glass-card overflow-hidden group transition-all hover:border-[var(--primary)]/50">
                <div className="aspect-[4/3] relative overflow-hidden">
                    <img
                        src={scooter.image}
                        alt={scooter.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-white/10">
                        <Zap className="w-3 h-3 text-[var(--primary)]" />
                        {scooter.type}
                    </div>
                </div>


                <div className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-lg leading-tight">{scooter.name}</h3>
                            <div className="flex items-center gap-1 text-white/40 text-xs mt-1">
                                <MapPin className="w-3 h-3" />
                                <span>{scooter.location} Station</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center gap-1 text-[var(--secondary)] font-bold text-sm">
                                <Star className="w-3 h-3 fill-current" />
                                {scooter.rating}
                            </div>
                            <p className="text-[10px] text-white/40">{scooter.reviews} reviews</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <div>
                            <span className="text-xl font-bold text-[var(--primary)]">${scooter.pricePerDay}</span>
                            <span className="text-xs text-white/40 font-medium ml-1">/ day</span>
                        </div>
                        <button className="text-xs font-bold text-white/60 hover:text-white transition-colors">
                            View Details
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
}

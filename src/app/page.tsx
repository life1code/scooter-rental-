"use client";

import { Navbar } from "@/frontend/components/Navbar";
import { ScooterCard } from "@/frontend/components/ScooterCard";
import { SCOOTERS } from "@/backend/data/scooters";
import { Search, Calendar as CalendarIcon, MapPin, SlidersHorizontal, X, ChevronDown, Bike, Gauge } from "lucide-react";
import { useState, useMemo, useEffect, useRef } from "react";
import { format } from "date-fns";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";

export default function Home() {
  const [location, setLocation] = useState("Unawatuna");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedModel, setSelectedModel] = useState("All Models");
  const [selectedEngine, setSelectedEngine] = useState("All Power");
  const [showCalendar, setShowCalendar] = useState(false);
  const [showModels, setShowModels] = useState(false);
  const [showEngine, setShowEngine] = useState(false);
  const [showLocations, setShowLocations] = useState(false);
  const [allScooters, setAllScooters] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const locations = ["Unawatuna", "Weligama", "Mirissa", "Ahangama"];

  // Load scooters from Database via API
  useEffect(() => {
    async function fetchScooters() {
      try {
        const res = await fetch('/api/scooters');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setAllScooters(data);
      } catch (error) {
        console.error("Failed to load scooters:", error);
        // Fallback or show error
      }
    }
    fetchScooters();
  }, []);

  // Filter scooters based on selected model, engine power, and location
  // We'll keep it reactive but add a visual "Search" trigger for better UX
  const filteredScooters = useMemo(() => {
    return allScooters.filter(scooter => {
      const matchLocation = scooter.location?.toLowerCase().includes(location.toLowerCase());
      const matchModel = selectedModel === "All Models" || scooter.name.toLowerCase().includes(selectedModel.toLowerCase());

      let matchEngine = true;
      if (selectedEngine !== "All Power") {
        const engineVal = scooter.specs?.engine ? parseInt(scooter.specs.engine) : 0;
        if (selectedEngine === "110cc") matchEngine = engineVal >= 100 && engineVal < 120;
        else if (selectedEngine === "125cc") matchEngine = engineVal >= 120 && engineVal < 140;
        else if (selectedEngine === "150cc+") matchEngine = engineVal >= 140;
      }

      // Mock availability logic: if dates are selected, randomly "book" some scooters
      // This makes the search feel "real" to the user
      let isAvailable = true;
      if (dateRange?.from && dateRange?.to) {
        // Use the scooter ID to keep the "availability" consistent for the same search
        const seed = parseInt(scooter.id) || 0;
        const hash = (seed * 13) % 10;
        isAvailable = hash > 2; // 80% availability mock
      }

      return matchLocation && matchModel && matchEngine && isAvailable;
    });
  }, [selectedModel, selectedEngine, location, dateRange, allScooters]);

  const handleSearch = () => {
    setIsSearching(true);
    // Mimic API delay for premium feel
    setTimeout(() => {
      setIsSearching(false);
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 800);
  };

  const spotlightItems = useMemo(() => {
    return allScooters.filter(scooter => scooter.isSpotlight);
  }, [allScooters]);

  const dateLabel = useMemo(() => {
    if (!dateRange?.from) return "Select dates";
    if (!dateRange.to) return format(dateRange.from, "MMM dd");
    return `${format(dateRange.from, "MMM dd")} - ${format(dateRange.to, "MMM dd")}`;
  }, [dateRange]);

  return (
    <main className="min-h-screen pb-20">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[85vh] md:min-h-[60vh] flex flex-col items-center justify-center px-4 pt-16 pb-32 md:pb-0">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--background)]"></div>
          <img
            src="/images/hero-road.png"
            alt="Hero background"
            className="w-full h-full object-cover opacity-30 scale-105 blur-[2px]"
          />
        </div>

        <div className="relative z-10 text-center space-y-8 max-w-5xl mb-12 md:mb-0">
          <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.9] drop-shadow-2xl">
            Freedom on <br className="md:hidden" />
            <span className="text-[var(--primary)] neon-text">Two Wheels.</span>
          </h1>
          <p className="text-white/80 text-xl md:text-3xl font-medium max-w-3xl mx-auto italic leading-tight">
            "Comfortable scooters. Easy booking. Ride your way"
          </p>
        </div>

        {/* Search Bar - Booking.com Style */}
        <div className="absolute -bottom-32 md:-bottom-12 left-4 right-4 max-w-[1400px] mx-auto z-50">
          <div className="glass-card p-2 md:p-3 shadow-2xl border-[var(--primary)]/20 bg-[var(--background)]/90 backdrop-blur-xl relative">
            <div className="flex flex-col xl:flex-row items-stretch gap-2">

              {/* Location Selector */}
              <div
                className="flex-[1.2] flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer relative"
                onClick={() => { setShowLocations(!showLocations); setShowCalendar(false); setShowModels(false); setShowEngine(false); }}
              >
                <MapPin className="w-5 h-5 text-[var(--primary)] shrink-0" />
                <div className="flex-1">
                  <p className="text-[10px] uppercase text-white/40 font-bold p-0 m-0">Location</p>
                  <p className="text-sm font-bold">{location}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${showLocations ? "rotate-180" : ""}`} />

                {showLocations && (
                  <div className="absolute top-[calc(100%+12px)] left-0 w-full z-[100] bg-[#1e2124] rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
                    {locations.map((loc) => (
                      <button
                        key={loc}
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocation(loc);
                          setShowLocations(false);
                        }}
                        className={`w-full text-left px-6 py-4 text-sm font-bold border-b border-white/5 last:border-none transition-colors hover:bg-[var(--primary)] hover:text-black ${location === loc ? "text-[var(--primary)]" : "text-white/60"}`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div
                className="flex-[1.2] flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer relative"
                onClick={() => { setShowCalendar(!showCalendar); setShowModels(false); setShowEngine(false); setShowLocations(false); }}
              >
                <CalendarIcon className="w-5 h-5 text-[var(--primary)] shrink-0" />
                <div className="flex-1">
                  <p className="text-[10px] uppercase text-white/40 font-bold p-0 m-0">Rental Dates</p>
                  <p className={`text-sm font-bold ${!dateRange?.from ? "text-white/20" : "text-white"}`}>
                    {dateLabel}
                  </p>
                </div>
                {showCalendar && (
                  <div
                    className="absolute top-[calc(100%+12px)] left-0 lg:left-auto xl:right-0 z-[100] bg-[#1e2124] p-4 rounded-2xl border border-white/10 shadow-2xl animate-in fade-in zoom-in-95"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-bold uppercase tracking-widest text-[var(--primary)]">Select Duration</span>
                      <button onClick={() => setShowCalendar(false)}><X className="w-4 h-4 text-white/40" /></button>
                    </div>
                    <DayPicker
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                      className="calendar-custom"
                    />
                  </div>
                )}
              </div>

              <div
                className="flex-1 flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer relative"
                onClick={() => { setShowModels(!showModels); setShowCalendar(false); setShowEngine(false); setShowLocations(false); }}
              >
                <Bike className="w-5 h-5 text-[var(--primary)] shrink-0" />
                <div className="flex-1">
                  <p className="text-[10px] uppercase text-white/40 font-bold p-0 m-0">Brand</p>
                  <p className="text-sm font-bold truncate">{selectedModel}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${showModels ? "rotate-180" : ""}`} />

                {showModels && (
                  <div className="absolute top-[calc(100%+12px)] left-0 right-0 z-[100] bg-[#1e2124] rounded-2xl border border-white/10 shadow-2xl max-h-64 overflow-y-auto no-scrollbar py-2 animate-in fade-in zoom-in-95">
                    {["All Models", "Honda", "Yamaha", "TVS", "Suzuki", "Vespa", "BMW", "KTM", "NIU"].map((m) => (
                      <button
                        key={m}
                        className="w-full text-left px-5 py-3 text-sm font-medium hover:bg-white/5 transition-colors flex items-center justify-between"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedModel(m);
                          setShowModels(false);
                        }}
                      >
                        {m}
                        {selectedModel === m && <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div
                className="flex-1 flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer relative"
                onClick={() => { setShowEngine(!showEngine); setShowCalendar(false); setShowModels(false); setShowLocations(false); }}
              >
                <Gauge className="w-5 h-5 text-[var(--primary)] shrink-0" />
                <div className="flex-1">
                  <p className="text-[10px] uppercase text-white/40 font-bold p-0 m-0">Engine</p>
                  <p className="text-sm font-bold">{selectedEngine}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${showEngine ? "rotate-180" : ""}`} />

                {showEngine && (
                  <div className="absolute top-[calc(100%+12px)] left-0 right-0 z-[100] bg-[#1e2124] rounded-2xl border border-white/10 shadow-2xl overflow-hidden py-2 animate-in fade-in zoom-in-95">
                    {["All Power", "110cc", "125cc", "150cc+"].map((ePower) => (
                      <button
                        key={ePower}
                        className="w-full text-left px-5 py-3 text-sm font-medium hover:bg-white/5 transition-colors flex items-center justify-between"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEngine(ePower);
                          setShowEngine(false);
                        }}
                      >
                        {ePower}
                        {selectedEngine === ePower && <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="btn-primary !py-4 xl:w-48 flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(45,212,191,0.2)] disabled:opacity-50"
              >
                {isSearching ? (
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span className="font-bold">Search</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section ref={resultsRef} className="max-w-7xl mx-auto px-4 mt-48 md:mt-24 space-y-12">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Available <span className="text-[var(--primary)]">rides</span></h2>
            <p className="text-white/40 text-sm mt-1">Showing {filteredScooters.length} scooters near {location}</p>
          </div>
          <button className="p-2 border border-white/10 rounded-xl hover:bg-white/5 transition-colors">
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>

        {filteredScooters.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredScooters.map((scooter) => (
              <ScooterCard key={scooter.id} scooter={scooter} />
            ))}
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
              <X className="w-8 h-8 text-white/20" />
            </div>
            <div>
              <h3 className="text-xl font-bold">No results found</h3>
              <p className="text-white/40">Try adjusting your filters or location.</p>
            </div>
          </div>
        )}


        {/* Brand Spotlight */}
        <div className="pt-20 pb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-4xl font-bold tracking-tight mb-2">Manufacturer <span className="text-[var(--primary)]">Spotlight</span></h2>
              <p className="text-white/40 max-w-md italic font-medium">Explore official technical specifications and heritage from brand manufacturers.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {spotlightItems.length > 0 ? (
              spotlightItems.map((brand, idx) => (
                <a
                  key={brand.id || idx}
                  href={brand.manufacturerUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card p-4 flex flex-col items-center gap-4 group hover:border-[var(--primary)]/40 transition-all duration-500 hover:-translate-y-2 border-white/5 bg-white/[0.02]"
                >
                  <div className={`w-full aspect-square rounded-xl bg-gradient-to-br ${["from-orange-500/10", "from-red-500/10", "from-blue-500/10", "from-slate-500/10", "from-yellow-500/10"][idx % 5]
                    } to-transparent overflow-hidden relative border border-white/5`}>
                    <img
                      src={brand.image}
                      alt={brand.name}
                      className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-sm tracking-wide group-hover:text-[var(--primary)] transition-colors line-clamp-1">{brand.name}</h3>
                    <p className="text-[9px] uppercase tracking-widest text-white/20 font-bold mt-1 text-center">Manufacturer Specs</p>
                  </div>
                </a>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-white/20 border border-dashed border-white/10 rounded-2xl">
                <Bike className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs uppercase tracking-widest font-bold">No Spotlight Items Promoted</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Background Calendar Styles */}
      <style jsx global>{`
        .calendar-custom {
          color: white;
          --rdp-cell-size: 40px;
          --rdp-accent-color: var(--primary);
          --rdp-background-color: var(--primary);
        }
        .calendar-custom .rdp-day_selected {
          background-color: var(--primary) !important;
          color: black !important;
          font-weight: 800 !important;
        }
        .calendar-custom .rdp-day_range_middle {
          background-color: rgba(45, 212, 191, 0.1) !important;
          color: var(--primary) !important;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </main>
  );
}

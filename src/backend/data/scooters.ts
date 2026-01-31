export interface Scooter {
    id: string;
    name: string;
    type: 'Electric' | 'Gas' | 'Special';
    pricePerDay: number;
    rating: number;
    reviews: number;
    image: string;
    description: string;
    specs: {
        range?: string;
        maxSpeed?: string;
        battery?: string;
        weight?: string;
        engine?: string;
    };
    isSpotlight?: boolean;
    manufacturerUrl?: string;
    location?: string;
    ownerName?: string;
    ownerWhatsapp?: string;
}

export const SCOOTERS: Scooter[] = [
    {
        id: '1',
        name: 'Honda PCX 160',
        type: 'Gas',
        pricePerDay: 25,
        rating: 4.9,
        reviews: 245,
        image: '/images/pcx.jpeg',
        description: 'Premium Honda PCX 160 with smooth handling and stylish design, perfect for long rides.',
        specs: {
            engine: '157cc',
            maxSpeed: '110 km/h',
            weight: '132 kg',
        },
        isSpotlight: true,
        manufacturerUrl: 'https://www.honda2wheelersindia.com/products/scooter/pcx-160',
        location: 'Unawatuna',
        ownerName: 'Ride Owner',
        ownerWhatsapp: '+94700000000'
    },
    {
        id: '2',
        name: 'TVS NTORQ 125',
        type: 'Gas',
        pricePerDay: 18,
        rating: 4.7,
        reviews: 189,
        image: '/images/NTORQ.jpeg',
        description: 'Sporty TVS NTORQ 125, known for its performance and smart connectivity features.',
        specs: {
            engine: '124.8cc',
            maxSpeed: '95 km/h',
            weight: '118 kg',
        },
        isSpotlight: true,
        manufacturerUrl: 'https://www.tvsmotor.com/tvs-ntorq',
        location: 'Unawatuna',
        ownerName: 'Ride Owner',
        ownerWhatsapp: '+94700000000'
    },
    {
        id: '3',
        name: 'Yamaha RayZR',
        type: 'Gas',
        pricePerDay: 20,
        rating: 4.8,
        reviews: 132,
        image: '/images/rayzr-yamaha-scooter.jpg',
        description: 'Lightweight and stylish Yamaha RayZR, ideal for city navigation and fuel efficiency.',
        specs: {
            engine: '125cc',
            maxSpeed: '90 km/h',
            weight: '99 kg',
        },
        isSpotlight: true,
        manufacturerUrl: 'https://www.yamaha-motor-india.com/yamaha-ray-zr-125-fi.html',
        location: 'Unawatuna',
        ownerName: 'Ride Owner',
        ownerWhatsapp: '+94700000000'
    },
    {
        id: '4',
        name: 'Honda Dio (Classic)',
        type: 'Gas',
        pricePerDay: 15,
        rating: 4.6,
        reviews: 312,
        image: '/images/dio old.jpeg',
        description: 'The classic Honda Dio, reliable and easy to ride for all skill levels.',
        specs: {
            engine: '110cc',
            maxSpeed: '85 km/h',
            weight: '105 kg',
        },
        location: 'Unawatuna',
        ownerName: 'Ride Owner',
        ownerWhatsapp: '+94700000000'
    },
    {
        id: '5',
        name: 'Suzuki Burgman Street',
        type: 'Gas',
        pricePerDay: 22,
        rating: 4.8,
        reviews: 156,
        image: '/images/suzuki burgman.jpeg',
        description: 'Maxi-scooter style Suzuki Burgman with extra storage and comfortable seating.',
        specs: {
            engine: '125cc',
            maxSpeed: '95 km/h',
            weight: '110 kg',
        },
        isSpotlight: true,
        manufacturerUrl: 'https://www.suzukimotorcycle.co.in/product-details/burgman-street',
        location: 'Unawatuna',
        ownerName: 'Ride Owner',
        ownerWhatsapp: '+94700000000'
    },
    {
        id: '6',
        name: 'Yamaha XMAX',
        type: 'Gas',
        pricePerDay: 45,
        rating: 5.0,
        reviews: 87,
        image: '/images/xmax.jpeg',
        description: 'Luxury Yamaha XMAX 300 for the ultimate riding experience with high-end features.',
        specs: {
            engine: '292cc',
            maxSpeed: '140 km/h',
            weight: '180 kg',
        },
        location: 'Unawatuna',
        ownerName: 'Ride Owner',
        ownerWhatsapp: '+94700000000'
    },
    {
        id: '7',
        name: 'Vespa Primavera 150',
        type: 'Gas',
        pricePerDay: 35,
        rating: 4.9,
        reviews: 124,
        image: '/images/pcx.jpeg',
        description: 'Timeless Italian style with the power of a 150cc engine. Perfect for cruising in style.',
        specs: {
            engine: '155cc',
            maxSpeed: '100 km/h',
            weight: '126 kg',
        },
        location: 'Unawatuna',
        ownerName: 'Ride Owner',
        ownerWhatsapp: '+94700000000'
    },
    {
        id: '8',
        name: 'Aprilia SR 160',
        type: 'Gas',
        pricePerDay: 28,
        rating: 4.7,
        reviews: 98,
        image: '/images/NTORQ.jpeg',
        description: 'The racer among scooters. High performance and aggressive styling for the thrill-seeker.',
        specs: {
            engine: '160cc',
            maxSpeed: '115 km/h',
            weight: '122 kg',
        },
        location: 'Unawatuna',
        ownerName: 'Ride Owner',
        ownerWhatsapp: '+94700000000'
    },
    {
        id: '9',
        name: 'TVS Jupiter 125',
        type: 'Gas',
        pricePerDay: 16,
        rating: 4.6,
        reviews: 210,
        image: '/images/rayzr-yamaha-scooter.jpg',
        description: 'Practical, fuel-efficient, and comfortable. Best choice for daily commutes.',
        specs: {
            engine: '124cc',
            maxSpeed: '90 km/h',
            weight: '108 kg',
        },
        location: 'Unawatuna',
        ownerName: 'Ride Owner',
        ownerWhatsapp: '+94700000000'
    },
    {
        id: '10',
        name: 'Suzuki Access 125',
        type: 'Gas',
        pricePerDay: 18,
        rating: 4.7,
        reviews: 165,
        image: '/images/suzuki burgman.jpeg',
        description: 'A blend of retro design and modern performance. Very reliable and smooth.',
        specs: {
            engine: '124cc',
            maxSpeed: '92 km/h',
            weight: '103 kg',
        },
        location: 'Unawatuna',
        ownerName: 'Ride Owner',
        ownerWhatsapp: '+94700000000'
    },
    {
        id: '11',
        name: 'Yamaha NMAX 155',
        type: 'Gas',
        pricePerDay: 32,
        rating: 4.9,
        reviews: 142,
        image: '/images/xmax.jpeg',
        description: 'Compact urban maxi-scooter with ABS and premium comfort features.',
        specs: {
            engine: '155cc',
            maxSpeed: '120 km/h',
            weight: '131 kg',
        },
        location: 'Unawatuna',
        ownerName: 'Ride Owner',
        ownerWhatsapp: '+94700000000'
    },
    {
        id: '12',
        name: 'Honda Grazia 125',
        type: 'Gas',
        pricePerDay: 20,
        rating: 4.8,
        reviews: 118,
        image: '/images/dio old.jpeg',
        description: 'Modern, sharp, and feature-rich 125cc scooter from Honda.',
        specs: {
            engine: '124cc',
            maxSpeed: '95 km/h',
            weight: '108 kg',
        },
        isSpotlight: true,
        manufacturerUrl: 'https://www.honda2wheelersindia.com/products/scooter/grazia-125',
        location: 'Unawatuna',
        ownerName: 'Ride Owner',
        ownerWhatsapp: '+94700000000'
    },
    {
        id: '13',
        name: 'NIU MQi GT',
        type: 'Electric',
        pricePerDay: 24,
        rating: 4.7,
        reviews: 56,
        image: '/images/pcx.jpeg',
        description: 'High-speed electric scooter with dual batteries. Modern tech for the modern traveler.',
        specs: {
            range: '100 km',
            maxSpeed: '70 km/h',
            battery: '2.9 kWh',
            weight: '115 kg',
        },
        location: 'Unawatuna',
        ownerName: 'Ride Owner',
        ownerWhatsapp: '+94700000000'
    },
    {
        id: '14',
        name: 'BMW C 400 X',
        type: 'Special',
        pricePerDay: 65,
        rating: 5.0,
        reviews: 34,
        image: '/images/xmax.jpeg',
        description: 'Premium adventure mid-size scooter with TFT display and connectivity.',
        specs: {
            engine: '350cc',
            maxSpeed: '139 km/h',
            weight: '204 kg',
        },
        location: 'Unawatuna',
        ownerName: 'Ride Owner',
        ownerWhatsapp: '+94700000000'
    },
    {
        id: '15',
        name: 'KTM 390 Adventure',
        type: 'Special',
        pricePerDay: 75,
        rating: 4.9,
        reviews: 82,
        image: '/images/NTORQ.jpeg',
        description: 'For those who want to go beyond the roads. Unmatched power and adventure capability.',
        specs: {
            engine: '373cc',
            maxSpeed: '155 km/h',
            weight: '158 kg',
        },
        location: 'Unawatuna',
        ownerName: 'Ride Owner',
        ownerWhatsapp: '+94700000000'
    },
];

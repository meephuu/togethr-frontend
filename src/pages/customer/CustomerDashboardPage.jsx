import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/ui/Navbar';
import CustomerTabs from '../../components/customer/CustomerTabs';
import ServiceCard from '../../components/search/ServiceCard';
import Button from '../../components/ui/Button';
import { searchServices } from '../../services/sprint2Api';

const TYPING_PHRASES = [
    "Discover new experiences with the right companion.",
    "Where to next? Find your perfect travel buddy here.",
    "Match your perfect trip with the perfect partner.",
    "Start your next great adventure with togethr.",
    "Never travel alone. Discover companions for your next journey.",
    "Find a local friend and make your trip unforgettable."
];

function TypewriterHeading() {
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const currentPhrase = TYPING_PHRASES[phraseIndex];
        let timeout;
        
        if (isDeleting) {
            if (charIndex > 0) {
                timeout = setTimeout(() => setCharIndex(c => c - 1), 20);
            } else {
                setIsDeleting(false);
                setPhraseIndex((prev) => (prev + 1) % TYPING_PHRASES.length);
            }
        } else {
            if (charIndex < currentPhrase.length) {
                timeout = setTimeout(() => setCharIndex(c => c + 1), 60);
            } else {
                timeout = setTimeout(() => setIsDeleting(true), 7500); 
            }
        }
        return () => clearTimeout(timeout);
    }, [charIndex, isDeleting, phraseIndex]);

    return (
        <div className="h-[120px] sm:h-[96px] mb-10 flex flex-col items-center justify-center">
            <h1 className="text-4xl md:text-[40px] leading-tight font-semibold text-gray-900 tracking-tight">
                {TYPING_PHRASES[phraseIndex].substring(0, charIndex)}
                <span className="border-r-[3px] border-gray-900 animate-[pulse_1s_ease-in-out_infinite] ml-1 pr-1"></span>
            </h1>
        </div>
    );
}

export default function CustomerDashboardPage() {
    const navigate = useNavigate();
    const [topPicks, setTopPicks] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchTopPicks = async () => {
            try {
                const params = new URLSearchParams();
                params.set('sortBy', 'rating_desc');
                params.set('limit', '4');
                const res = await searchServices(params);
                setTopPicks(res.data);
            } catch (err) {
                console.error("Failed to fetch top picks", err);
            }
        };
        fetchTopPicks();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        } else {
            navigate(`/search`);
        }
    };

    const categories = [
        { name: "Foodie Trip", image: "/catagories/food.png" },
        { name: "Photography", image: "/catagories/photography.png" },
        { name: "Adventure", image: "/catagories/adventure.png" },
        { name: "Nightlife", image: "/catagories/nightlife.png" },
    ];

    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-b from-white via-white to-[#155DFC]">
            <Navbar>
                <CustomerTabs />
            </Navbar>

            <main className="flex-1 flex flex-col pt-16 pb-24">
                {/* Hero Section */}
                <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 text-center pt-15">
                    <TypewriterHeading />
                    
                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-4 mb-16 max-w-3xl mx-auto">
                        <div className="flex-1 flex items-center gap-3 w-full bg-white rounded-xl px-4 py-3 border border-gray-200 shadow-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 bg-transparent border-none outline-none text-base text-gray-900 placeholder:text-gray-500"
                            />
                        </div>
                        <Button type="submit" className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-[15px]">
                            Search
                        </Button>
                    </form>

                </div>

                {/* Categories */}
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {categories.map(cat => {
                            const searchName = cat.name === "Foodie Trip" ? "Food tour" 
                                             : cat.name === "Adventure" ? "Nature & Hiking" 
                                             : cat.name;
                            return (
                                <Link 
                                    key={cat.name} 
                                    to={`/search?interests=${encodeURIComponent(searchName)}`}
                                    className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-sm group block"
                                >
                                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors" />
                                    <div className="absolute bottom-4 right-4 text-right">
                                        <span style={{ fontFamily: 'var(--font-heading)' }} className="text-white font-medium text-xl drop-shadow-md tracking-wide">{cat.name}</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Top Picks For You */}
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
                    <h2 className="text-3xl font-medium text-white mb-8">Top Picks for You</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {topPicks.map(service => (
                            <ServiceCard key={service.id} service={service} />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PageShell from "../../components/ui/PageShell";
import CustomerTabs from "../../components/customer/CustomerTabs";
import Button from "../../components/ui/Button";

// ==========================================
// Mock Data (Temporary)
// ==========================================
const TEMP_SERVICE = {
    id: "serv-123",
    title: "Old Town street food walk",
    location: "Bangkok - Yaowarat",
    description: `We'll meet at Wat Mangkon just as the sun sets and the evening lanterns light up through the temple incense. From there, we dive into the neon-lit chaos of Yaowarat Road, letting the sharp scent of charcoal and sizzling woks guide our route. We'll hunt down the best street carts, starting with peppery rolled noodles and wok-charred chicken. Next, we'll crack into giant river prawns and smoky grilled squid, dipping the seafood into sharply sour green chili sauce. We'll finish the night with sweet, perfectly ripe nam dok mai mango over warm, coconut-soaked sticky rice.\n\nThere's no need to point at pictures or guess what's in the bowls. Because I speak fluent Thai and English, I'll handle all the ordering, negotiate with the vendors, customize the spice levels to your exact preference, and ensure we get the off-menu local favorites.`,
    rate: 450.00,
    rateUnit: "hour", // Assuming unit exists, design shows "/ hour"
    avgRating: 4.8,
    reviewCount: 32,
    categories: ["Photography", "Shopping"],
    provider: {
        firstname: "Nina",
        lastname: "Smith",
        avatar: null // Use default avatar
    },
    coverImage: "https://images.unsplash.com/photo-1582298538104-fe2e74cb07f2?q=80&w=2070&auto=format&fit=crop"
};

const TEMP_REVIEWS = [
    {
        id: "rev-1",
        author: "Matty",
        rating: 4.5,
        comment: "We had an incredible evening exploring Yaowarat Road with Nina. Starting out at Wat Mangkon right at sunset set such a great atmosphere before diving into the busy street food scene. The food itself was phenomenal",
        date: "October 3, 2026"
    },
    {
        id: "rev-2",
        author: "Nene",
        rating: 4.0,
        comment: "What really made this experience good was having a guide who is completely fluent in both Thai and English.",
        date: "September 16, 2026"
    },
    {
        id: "rev-3",
        author: "Clara",
        rating: 5.0,
        comment: "It felt like walking around with a local friend who knows all the best spots. Highly recommend this to anyone visiting Bangkok!",
        date: "September 20, 2026"
    }
];

// ==========================================
// Component
// ==========================================
export default function ServiceDetailPage() {
    const { id } = useParams();
    
    // In the future, you will fetch the service by ID here:
    // const [service, setService] = useState(null);
    // useEffect(() => { getServiceById(id).then(setService) }, [id]);

    const service = TEMP_SERVICE;
    const reviews = TEMP_REVIEWS;

    return (
        <PageShell subnav={<CustomerTabs />}>
            <div className="flex flex-col lg:flex-row gap-8 items-start">
                
                {/* Left Column: Details */}
                <div className="flex-1 w-full min-w-0 flex flex-col gap-8">
                    {/* Cover Image */}
                    <div className="w-full h-[300px] sm:h-[400px] md:h-[450px] bg-gray-200 rounded-2xl overflow-hidden shadow-sm">
                        <img 
                            src={service.coverImage} 
                            alt={service.title} 
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Header Info */}
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-start gap-4">
                            <h1 className="text-3xl font-bold text-text-main leading-tight">
                                {service.title}
                            </h1>
                            <div className="flex items-center gap-1.5 shrink-0 mt-1">
                                <svg className="w-5 h-5 text-[#E7711B]" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="font-bold text-lg text-text-main">{service.avgRating}</span>
                                <span className="text-text-muted">({service.reviewCount})</span>
                            </div>
                        </div>
                        
                        <p className="text-text-muted">{service.location}</p>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-500 overflow-hidden">
                                {service.provider.avatar ? (
                                    <img src={service.provider.avatar} alt={service.provider.firstname} className="w-full h-full object-cover" />
                                ) : (
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                )}
                            </div>
                            <span className="font-medium text-text-main">{service.provider.firstname}</span>
                        </div>

                        {/* Chips */}
                        <div className="flex flex-wrap gap-2 mt-1">
                            {service.categories.map(cat => (
                                <span key={cat} className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm text-text-main font-medium shadow-sm">
                                    {cat}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="text-text-muted whitespace-pre-wrap leading-relaxed mt-2">
                        {service.description}
                    </div>

                    {/* Reviews */}
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold text-text-main mb-6">Customer Reviews</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {reviews.map(review => (
                                <div key={review.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4 h-full">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-500 overflow-hidden">
                                                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                            </div>
                                            <span className="font-medium text-text-main text-sm">{review.author}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <svg className="w-4 h-4 text-[#E7711B]" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            <span className="font-bold text-sm text-text-main">{review.rating.toFixed(1)}</span>
                                        </div>
                                    </div>
                                    <p className="text-text-muted text-sm leading-relaxed flex-1">
                                        {review.comment}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-2">
                                        Posted {review.date}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Booking Card */}
                <div className="w-full lg:w-[350px] shrink-0 sticky top-24">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-6">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-text-main">Price</span>
                            <span className="font-bold text-lg text-text-main">
                                ฿{service.rate} <span className="font-normal text-sm text-text-muted">/ {service.rateUnit}</span>
                            </span>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-text-main">Service Date</label>
                            <input 
                                type="text" 
                                placeholder="Select Date" 
                                disabled
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-text-main placeholder:text-gray-400 bg-gray-50 focus:outline-none cursor-not-allowed"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-text-main">Service Time</label>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="text" 
                                    placeholder="Start Time" 
                                    disabled
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-text-main placeholder:text-gray-400 bg-gray-50 focus:outline-none cursor-not-allowed"
                                />
                                <span className="text-gray-400">-</span>
                                <input 
                                    type="text" 
                                    placeholder="End Time" 
                                    disabled
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-text-main placeholder:text-gray-400 bg-gray-50 focus:outline-none cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                            <span className="font-semibold text-text-main">Final Price</span>
                            <span className="font-bold text-xl text-text-main">
                                ฿1350
                            </span>
                        </div>

                        <Button variant="primary" disabled className="w-full h-12 text-[15px]">
                            Book This Service
                        </Button>
                    </div>
                </div>

            </div>
        </PageShell>
    );
}


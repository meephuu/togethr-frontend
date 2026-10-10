import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PageShell from "../../components/ui/PageShell";
import CustomerTabs from "../../components/customer/CustomerTabs";
import Button from "../../components/ui/Button";
import { assetUrl } from "../../lib/assets";

// ==========================================
// Component
// ==========================================
export default function ServiceDetailPage() {
    const { id } = useParams();
    
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form states for booking
    const [selectedStartTime, setSelectedStartTime] = useState("");
    const [selectedEndTime, setSelectedEndTime] = useState("");

    useEffect(() => {
        setLoading(true);
        setError(null);
        fetch(`http://localhost:8081/api/services/${id}`)
            .then(res => {
                if (!res.ok) {
                    if (res.status === 404) throw new Error("Service not found.");
                    if (res.status === 410) throw new Error("This service is no longer available.");
                    throw new Error("Failed to load service details.");
                }
                return res.json();
            })
            .then(data => {
                setService(data.service);
                if (data.service.startTime) setSelectedStartTime(data.service.startTime.slice(0, 5));
                if (data.service.endTime) setSelectedEndTime(data.service.endTime.slice(0, 5));
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return (
            <PageShell subnav={<CustomerTabs />}>
                <div className="flex justify-center items-center h-[50vh] text-text-muted">
                    Loading service...
                </div>
            </PageShell>
        );
    }

    if (error) {
        return (
            <PageShell subnav={<CustomerTabs />}>
                <div className="flex flex-col gap-4 justify-center items-center h-[50vh] text-center">
                    <p className="text-xl font-medium text-text-main">{error}</p>
                    <Button variant="outline" onClick={() => window.history.back()}>Go Back</Button>
                </div>
            </PageShell>
        );
    }

    if (!service) return null;

    // Derived defaults if backend fields are missing
    const coverImage = service.coverPhotoUrl || "https://images.unsplash.com/photo-1582298538104-fe2e74cb07f2?q=80&w=2070&auto=format&fit=crop";
    const rateUnit = service.rateUnit || "hour";
    const reviews = service.reviews || [];
    const reviewCount = service.reviewCount || reviews.length;
    
    let avgRating = "New";
    if (reviews.length > 0) {
        const total = reviews.reduce((sum, rev) => sum + Number(rev.rating), 0);
        avgRating = (total / reviews.length).toFixed(1);
    } else if (service.provider.avgRating) {
        avgRating = Number(service.provider.avgRating).toFixed(1);
    }

    const providerAvatar = assetUrl(service.provider.profilePhotoUrl);
    const startTime = service.startTime ? service.startTime.slice(0, 5) : "";
    const endTime = service.endTime ? service.endTime.slice(0, 5) : "";
    const categories = service.categories || [];

    let finalPrice = service.rate;
    if (rateUnit === "hour" && selectedStartTime && selectedEndTime) {
        const [startH, startM] = selectedStartTime.split(':').map(Number);
        const [endH, endM] = selectedEndTime.split(':').map(Number);
        const diff = (endH + endM / 60) - (startH + startM / 60);
        if (diff > 0) {
            finalPrice = diff * service.rate;
        } else {
            finalPrice = 0;
        }
    }

    return (
        <PageShell subnav={<CustomerTabs />}>
            <div className="flex flex-col lg:flex-row gap-8 items-start">
                
                {/* Left Column: Details */}
                <div className="flex-1 w-full min-w-0 flex flex-col gap-8">
                    {/* Cover Image */}
                    <div className="w-full h-[300px] sm:h-[400px] md:h-[450px] bg-gray-200 rounded-2xl overflow-hidden shadow-sm">
                        <img 
                            src={coverImage} 
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
                                <span className="font-bold text-lg text-text-main">{avgRating}</span>
                                <span className="text-text-muted">({reviewCount})</span>
                            </div>
                        </div>
                        
                        <p className="text-text-muted">{service.location}</p>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-500 overflow-hidden">
                                {providerAvatar ? (
                                    <img src={providerAvatar} alt={service.provider.firstname} className="w-full h-full object-cover" />
                                ) : (
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                )}
                            </div>
                            <span className="font-medium text-text-main">{service.provider.firstname}</span>
                        </div>

                        {/* Chips */}
                        {categories.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-1">
                                {categories.map((cat, i) => (
                                    <span key={i} className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm text-text-main font-medium shadow-sm">
                                        {cat}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    {service.description && (
                        <div className="text-text-muted whitespace-pre-wrap leading-relaxed mt-2">
                            {service.description}
                        </div>
                    )}

                    {/* Reviews */}
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold text-text-main mb-6">Customer Reviews</h2>
                        {reviews.length > 0 ? (
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
                                                <span className="font-bold text-sm text-text-main">{Number(review.rating).toFixed(1)}</span>
                                            </div>
                                        </div>
                                        <p className="text-text-muted text-sm leading-relaxed flex-1">
                                            {review.comment}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-2">
                                            Posted {new Date(review.date || review.timestamp).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-text-muted">
                                This service has not yet been reviewed.
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Booking Card */}
                <div className="w-full lg:w-[350px] shrink-0 sticky top-24">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-6">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-text-main">Price</span>
                            <span className="font-bold text-lg text-text-main">
                                ฿{service.rate} <span className="font-normal text-sm text-text-muted">/ {rateUnit}</span>
                            </span>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-text-main">Service Date</label>
                            <input 
                                type="date" 
                                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-text-main bg-white focus:outline-none focus:border-[#E7711B] focus:ring-1 focus:ring-[#E7711B]"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-text-main">Service Time</label>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="time" 
                                    value={selectedStartTime}
                                    onChange={(e) => setSelectedStartTime(e.target.value)}
                                    min={startTime}
                                    max={endTime}
                                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-text-main bg-white focus:outline-none focus:border-[#E7711B] focus:ring-1 focus:ring-[#E7711B]"
                                />
                                <span className="text-gray-400">-</span>
                                <input 
                                    type="time" 
                                    value={selectedEndTime}
                                    onChange={(e) => setSelectedEndTime(e.target.value)}
                                    min={startTime}
                                    max={endTime}
                                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-text-main bg-white focus:outline-none focus:border-[#E7711B] focus:ring-1 focus:ring-[#E7711B]"
                                />
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                            <span className="font-semibold text-text-main">Final Price</span>
                            <span className="font-bold text-xl text-text-main">
                                ฿{Number(finalPrice).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
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


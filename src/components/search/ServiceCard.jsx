import { Link } from "react-router-dom";
import { StarFilledIcon, UserIcon } from "../ui/icons";

export default function ServiceCard({ service }) {
    // service has: id, title, location, rate, rateUnit, coverPhotoUrl, provider (firstname, lastname, avgRating), reviewCount
    const imageUrl = service.coverPhotoUrl
        ? (service.coverPhotoUrl.startsWith("http") ? service.coverPhotoUrl : `http://localhost:8081${service.coverPhotoUrl}`)
        : "https://placehold.co/600x400/e2e8f0/64748b?text=No+image";

    const hasReviews = service.provider.avgRating !== null && service.reviewCount > 0;
    
    return (
        <Link
            to={`/services/${service.id}`}
            className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
            <div className="aspect-[3/2] w-full overflow-hidden bg-gray-100">
                <img
                    src={imageUrl}
                    alt={service.title}
                    className="h-full w-full object-cover"
                />
            </div>
            <div className="flex flex-1 flex-col p-5">
                <p style={{ fontFamily: 'var(--font-body)' }} className="line-clamp-2 text-[16px] font-semibold leading-tight text-text-main">
                    {service.title}
                </p>
                <p className="mt-1 text-[13px] text-text-muted">{service.location}</p>
                <div className="mt-3 mb-5 flex items-center gap-2">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                        <UserIcon size={12} />
                    </div>
                    <span className="text-[13px] text-text-main">{service.provider.firstname}</span>
                </div>
                
                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                    {hasReviews ? (
                        <div className="flex items-center gap-1">
                            <StarFilledIcon size={14} className="text-[#E7711B]" />
                            <span className="text-[15px] font-bold text-text-main">{service.provider.avgRating.toFixed(1)}</span>
                            <span className="text-[15px] text-text-muted">({service.reviewCount})</span>
                        </div>
                    ) : (
                        <div className="text-[15px] text-text-muted">New</div>
                    )}
                    <div className="text-[15px]">
                        <span className="font-bold text-text-main">฿{service.rate.toLocaleString("en-US")}</span>
                        <span className="text-[15px] text-text-muted"> / {service.rateUnit}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}


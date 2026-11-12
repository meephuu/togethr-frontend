import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../components/ui/Navbar";
import Footer from "../../components/ui/Footer";
import Avatar from "../../components/ui/Avatar";
import { StarFilledIcon } from "../../components/ui/Icons";
import ServiceCard from "../../components/search/ServiceCard";
import { ApiError, UsersService } from "../../services/generated";
import { interestLabel, toArray } from "../../lib/providerOptions";

function ChipGroup({ title, items }) {
    if (items.length === 0) return null;
    return (
        <div>
            <p className="text-sm font-medium text-text-main mb-2">{title}</p>
            <div className="flex flex-wrap gap-2">
                {items.map((item) => (
                    <span key={item} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {item}
                    </span>
                ))}
            </div>
        </div>
    );
}

// Reviews and services share one grid: 1 column on mobile, 2 on tablet, 3 on desktop.
const GRID_CLASS = "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3";

// The API sends reviews newest first; the profile shows only the latest few.
const REVIEWS_SHOWN = 3;

function ProfileSection({ title, children }) {
    return (
        <section className="mt-12">
            <h2 className="text-xl font-bold text-text-main mb-4">{title}</h2>
            {children}
        </section>
    );
}

function ReviewGrid({ reviews }) {
    if (reviews.length === 0) return <p className="text-sm text-text-muted">No reviews yet</p>;
    return (
        <ul className={GRID_CLASS}>
            {reviews.slice(0, REVIEWS_SHOWN).map((review) => (
                // Grid items stretch, so the cards in a row share the tallest one's height
                <li key={review.id} className="flex flex-col bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <p className="font-medium text-text-main text-sm">{review.author}</p>
                            <p className="truncate text-xs text-text-muted">for {review.serviceTitle}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                            <StarFilledIcon size={16} className="text-[#E7711B]" />
                            <span className="font-bold text-sm text-text-main">{Number(review.rating).toFixed(1)}</span>
                        </div>
                    </div>
                    {review.comment && (
                        <p className="mt-3 line-clamp-4 text-text-muted text-sm leading-relaxed whitespace-pre-wrap">
                            {review.comment}
                        </p>
                    )}
                    <p className="mt-auto pt-3 text-xs text-gray-400">
                        Posted {new Date(review.date).toLocaleDateString()}
                    </p>
                </li>
            ))}
        </ul>
    );
}

function ServiceGrid({ services }) {
    if (services.length === 0) return <p className="text-sm text-text-muted">No services listed yet</p>;
    return (
        <div className={GRID_CLASS}>
            {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
            ))}
        </div>
    );
}

export default function PublicProfilePage() {
    const { id } = useParams();
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadProfile() {
            setIsLoading(true);
            setError("");

            try {
                const response = await UsersService.getPublicProfile({ id });
                if (!cancelled) setProfile(response.user);
            } catch (err) {
                if (cancelled) return;
                if (err instanceof ApiError && err.status === 404) {
                    setError("This profile could not be found.");
                } else {
                    setError("Could not load this profile. Please try again.");
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }

        loadProfile();

        return () => {
            cancelled = true;
        };
    }, [id]);

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* One width for the details card, reviews and services, wide enough for the 3-column grids */}
            <div className="max-w-5xl mx-auto px-4 py-16">
                {isLoading && <p className="text-text-muted">Loading profile...</p>}
                {!isLoading && error && <p className="text-red-600">{error}</p>}

                {!isLoading && !error && profile && (
                    <div className="bg-background rounded-2xl shadow-sm border border-gray-100 p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <Avatar
                                    photoUrl={profile.profilePhotoUrl}
                                    firstname={profile.firstname}
                                    lastname={profile.lastname}
                                    size="lg"
                                />
                                <div>
                                    <h1 className="text-2xl font-bold text-text-main">
                                        {profile.firstname} {profile.lastname}
                                    </h1>
                                    <p className="text-text-muted">@{profile.username}</p>
                                </div>
                            </div>
                            {profile.provider && (
                                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                                    Provider
                                </span>
                            )}
                        </div>

                        {profile.provider ? (
                            <div className="space-y-4">
                                {profile.provider.avgRating && (
                                    <p className="text-sm text-text-main">
                                        ⭐ {profile.provider.avgRating} average rating
                                    </p>
                                )}
                                {profile.provider.bio && (
                                    <p className="text-sm text-text-muted leading-relaxed">{profile.provider.bio}</p>
                                )}
                                <ChipGroup title="Languages" items={toArray(profile.provider.languages)} />
                                <ChipGroup
                                    title="Interests"
                                    items={toArray(profile.provider.interests).map(interestLabel)}
                                />
                                <ChipGroup title="Service area" items={toArray(profile.provider.serviceArea)} />
                            </div>
                        ) : (
                            <p className="text-sm text-text-muted">This user is a customer on Togethr.</p>
                        )}

                        {(profile.instagram || profile.line || profile.facebook) && (
                            <div className="mt-6 pt-6 border-t border-gray-100 flex gap-4 text-sm text-text-muted">
                                {profile.instagram && <span>Instagram: {profile.instagram}</span>}
                                {profile.line && <span>Line: {profile.line}</span>}
                                {profile.facebook && <span>Facebook: {profile.facebook}</span>}
                            </div>
                        )}
                    </div>
                )}

                {/* Providers only: customers' profiles have neither section */}
                {!isLoading && !error && profile?.provider && (
                    <>
                        <ProfileSection
                            title={profile.reviews?.length ? `Reviews (${profile.reviews.length})` : "Reviews"}
                        >
                            <ReviewGrid reviews={profile.reviews ?? []} />
                        </ProfileSection>
                        <ProfileSection title="Services">
                            <ServiceGrid services={profile.services ?? []} />
                        </ProfileSection>
                    </>
                )}
            </div>

            <Footer />
        </div>
    );
}

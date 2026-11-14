import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../components/ui/Navbar";
import Footer from "../../components/ui/Footer";
import Avatar from "../../components/ui/Avatar";
import ServiceCard from "../../components/search/ServiceCard";
import ProviderReviews from "../../components/review/ProviderReviews";
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

// Services share the reviews' grid: 1 column on mobile, 2 on tablet, 3 on desktop.
const GRID_CLASS = "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3";

function ProfileSection({ title, children }) {
    return (
        <section className="mt-12">
            <h2 className="text-xl font-bold text-text-main mb-4">{title}</h2>
            {children}
        </section>
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
                        {/* Pages through GET /api/providers/:id/reviews (US8-2); keyed so another profile starts on page 1 */}
                        <ProviderReviews key={profile.id} providerId={profile.id} />
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

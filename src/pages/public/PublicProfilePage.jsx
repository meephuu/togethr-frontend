import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../components/ui/Navbar";
import Footer from "../../components/ui/Footer";
import { ApiError, UsersService } from "../../services/generated";

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

            <div className="max-w-2xl mx-auto px-4 py-16">
                {isLoading && <p className="text-text-muted">Loading profile...</p>}
                {!isLoading && error && <p className="text-red-600">{error}</p>}

                {!isLoading && !error && profile && (
                    <div className="bg-background rounded-2xl shadow-sm border border-gray-100 p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-text-main">
                                    {profile.firstname} {profile.lastname}
                                </h1>
                                <p className="text-text-muted">@{profile.username}</p>
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
                                {profile.provider.languages && (
                                    <p className="text-sm text-text-muted">
                                        <span className="font-medium text-text-main">Languages: </span>
                                        {profile.provider.languages}
                                    </p>
                                )}
                                {profile.provider.bio && (
                                    <p className="text-sm text-text-muted leading-relaxed">{profile.provider.bio}</p>
                                )}
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
            </div>

            <Footer />
        </div>
    );
}

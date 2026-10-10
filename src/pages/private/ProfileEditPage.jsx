import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/ui/Navbar";
import Footer from "../../components/ui/Footer";
import Button from "../../components/ui/Button";
import ChipSelect from "../../components/ui/ChipSelect";
import ProfilePhotoField from "../../components/profile/ProfilePhotoField";
import { useAuth } from "../../hooks/useAuth";
import { ApiError, UsersService } from "../../services/generated";
import {
    INTEREST_OPTIONS,
    LANGUAGE_OPTIONS,
    SERVICE_AREA_OPTIONS,
    toArray,
} from "../../lib/providerOptions";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const emptyForm = {
    email: "",
    firstname: "",
    lastname: "",
    gender: "",
    bdate: "",
    bankAccount: "",
    phoneNumber: "",
    instagram: "",
    line: "",
    facebook: "",
    bio: "",
    languages: [],
    interests: [],
    serviceArea: [],
};

function toDateInputValue(value) {
    if (!value) return "";
    return String(value).slice(0, 10);
}

export default function ProfileEditPage() {
    const navigate = useNavigate();
    const { user, setUser, isAuthenticated } = useAuth();

    const [formData, setFormData] = useState(emptyForm);
    const [isProvider, setIsProvider] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadError, setLoadError] = useState("");
    const [apiError, setApiError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState("");
    const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login", { replace: true });
            return;
        }

        let cancelled = false;

        UsersService.getMyProfile()
            .then((response) => {
                if (cancelled) return;
                const profile = response.user;
                setFormData({
                    email: profile.email ?? "",
                    firstname: profile.firstname ?? "",
                    lastname: profile.lastname ?? "",
                    gender: profile.gender ?? "",
                    bdate: toDateInputValue(profile.bdate),
                    bankAccount: profile.bankAccount ?? "",
                    phoneNumber: profile.phoneNumber ?? "",
                    instagram: profile.instagram ?? "",
                    line: profile.line ?? "",
                    facebook: profile.facebook ?? "",
                    bio: profile.provider?.bio ?? "",
                    languages: toArray(profile.provider?.languages),
                    interests: toArray(profile.provider?.interests),
                    serviceArea: toArray(profile.provider?.serviceArea),
                });
                setIsProvider(!!profile.provider);
                setProfilePhotoUrl(profile.profilePhotoUrl ?? null);
                // Sessions saved before profile photos existed have no
                // profilePhotoUrl; bring the Navbar's copy up to date.
                if (user && (user.profilePhotoUrl ?? null) !== (profile.profilePhotoUrl ?? null)) {
                    setUser({ ...user, profilePhotoUrl: profile.profilePhotoUrl ?? null });
                }
            })
            .catch(() => {
                if (!cancelled) setLoadError("Could not load your profile. Please try again.");
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleChipsChange = (name) => (selected) => {
        setFormData((prev) => ({ ...prev, [name]: selected }));
        setSuccessMessage("");
        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.firstname.trim()) newErrors.firstname = "First name is required";
        if (!formData.lastname.trim()) newErrors.lastname = "Last name is required";
        if (formData.email && !emailRegex.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }
        if (isProvider && formData.languages.length === 0) {
            newErrors.languages = "Please select at least one language";
        }

        setFieldErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError("");
        setSuccessMessage("");

        if (!validate()) return;

        setIsSubmitting(true);
        try {
            const requestBody = {
                email: formData.email,
                firstname: formData.firstname,
                lastname: formData.lastname,
                gender: formData.gender || undefined,
                bdate: formData.bdate || undefined,
                bankAccount: formData.bankAccount,
                phoneNumber: formData.phoneNumber,
                instagram: formData.instagram,
                line: formData.line,
                facebook: formData.facebook,
            };

            if (isProvider) {
                requestBody.bio = formData.bio;
                requestBody.languages = formData.languages.join(", ");
                requestBody.interests = formData.interests;
                requestBody.serviceArea = formData.serviceArea;
            }

            const response = await UsersService.updateMyProfile({ requestBody });

            setUser({ ...user, ...response.user });
            setSuccessMessage("Profile updated.");
        } catch (error) {
            if (error instanceof ApiError) {
                setApiError(error.body?.error || "Could not update your profile. Please try again.");
            } else {
                setApiError("Could not connect to the server. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <div className="max-w-lg mx-auto px-4 py-16">
                <h1 className="text-2xl font-bold text-text-main mb-8">Edit Profile</h1>

                {isLoading ? (
                    <p className="text-text-muted">Loading your profile...</p>
                ) : loadError ? (
                    <p className="text-red-600">{loadError}</p>
                ) : (
                    <>
                    <ProfilePhotoField
                        photoUrl={profilePhotoUrl}
                        firstname={formData.firstname}
                        lastname={formData.lastname}
                        onChange={(url) => {
                            setProfilePhotoUrl(url);
                            setUser({ ...user, profilePhotoUrl: url });
                        }}
                    />
                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-text-main mb-2">First Name</label>
                                <input
                                    name="firstname"
                                    type="text"
                                    value={formData.firstname}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    className={`w-full px-4 py-2.5 rounded-lg border text-sm text-text-main focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                                        fieldErrors.firstname ? "border-red-500 focus:ring-red-500" : "border-gray-200 focus:ring-primary"
                                    }`}
                                />
                                {fieldErrors.firstname && <p className="text-red-500 text-xs mt-1">{fieldErrors.firstname}</p>}
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-text-main mb-2">Last Name</label>
                                <input
                                    name="lastname"
                                    type="text"
                                    value={formData.lastname}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    className={`w-full px-4 py-2.5 rounded-lg border text-sm text-text-main focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                                        fieldErrors.lastname ? "border-red-500 focus:ring-red-500" : "border-gray-200 focus:ring-primary"
                                    }`}
                                />
                                {fieldErrors.lastname && <p className="text-red-500 text-xs mt-1">{fieldErrors.lastname}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-main mb-2">Email Address</label>
                            <input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={isSubmitting}
                                className={`w-full px-4 py-2.5 rounded-lg border text-sm text-text-main focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                                    fieldErrors.email ? "border-red-500 focus:ring-red-500" : "border-gray-200 focus:ring-primary"
                                }`}
                            />
                            {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
                        </div>

                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-text-main mb-2">Gender</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                >
                                    <option value="">Prefer not to say</option>
                                    <option value="M">Male</option>
                                    <option value="F">Female</option>
                                    <option value="O">Other</option>
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-text-main mb-2">Birth Date</label>
                                <input
                                    name="bdate"
                                    type="date"
                                    value={formData.bdate}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-main mb-2">Phone Number</label>
                            <input
                                name="phoneNumber"
                                type="tel"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                disabled={isSubmitting}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-main mb-2">Bank Account</label>
                            <input
                                name="bankAccount"
                                type="text"
                                value={formData.bankAccount}
                                onChange={handleChange}
                                disabled={isSubmitting}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-text-main mb-2">Instagram</label>
                                <input
                                    name="instagram"
                                    type="text"
                                    value={formData.instagram}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-main mb-2">Line</label>
                                <input
                                    name="line"
                                    type="text"
                                    value={formData.line}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-main mb-2">Facebook</label>
                                <input
                                    name="facebook"
                                    type="text"
                                    value={formData.facebook}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {isProvider && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-text-main mb-2">Bio</label>
                                    <textarea
                                        name="bio"
                                        rows={3}
                                        value={formData.bio}
                                        onChange={handleChange}
                                        disabled={isSubmitting}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    />
                                </div>
                                <section className="space-y-8 pt-8 mt-4 border-t border-gray-100">
                                    <div>
                                        <h2 className="text-lg text-text-main">Provider details</h2>
                                        <p className="text-sm text-text-muted mt-1">Customers use these to find and match with you.</p>
                                    </div>
                                <ChipSelect
                                    label="Languages"
                                    hint="Select at least one"
                                    required
                                    options={LANGUAGE_OPTIONS}
                                    value={formData.languages}
                                    onChange={handleChipsChange("languages")}
                                    error={fieldErrors.languages}
                                    disabled={isSubmitting}
                                />
                                <ChipSelect
                                    label="Interests"
                                    options={INTEREST_OPTIONS}
                                    value={formData.interests}
                                    onChange={handleChipsChange("interests")}
                                    disabled={isSubmitting}
                                />
                                <ChipSelect
                                    label="Service area"
                                    hint="Where you can meet customers"
                                    options={SERVICE_AREA_OPTIONS}
                                    value={formData.serviceArea}
                                    onChange={handleChipsChange("serviceArea")}
                                    disabled={isSubmitting}
                                />
                                </section>
                            </>
                        )}

                        {apiError && (
                            <p className="text-sm text-red-600" role="alert">{apiError}</p>
                        )}
                        {successMessage && (
                            <p className="text-sm text-green-600" role="status">{successMessage}</p>
                        )}

                        <Button type="submit" variant="primary" className="w-full mt-4" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </Button>
                    </form>
                    </>
                )}
            </div>

            <Footer />
        </div>
    );
}

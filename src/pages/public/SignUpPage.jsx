import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import ConsentCheckbox from "../../components/ui/ConsentCheckbox";
import PrivacyPolicyModal from "../../components/ui/PrivacyPolicyModal";
import { useAuth } from "../../hooks/useAuth";
import { ApiError, AuthService } from "../../services/generated";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUpPage() {
    const navigate = useNavigate();
    const { setUser } = useAuth();

    const [showPolicyModal, setShowPolicyModal] = useState(true);
    const [formData, setFormData] = useState({
        username: "",
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        confirmPassword: "",
        consent: false,
    });
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handlePolicyAccept = () => {
        setFormData((prev) => ({ ...prev, consent: true }));
        setErrors((prev) => ({ ...prev, consent: undefined }));
        setShowPolicyModal(false);
    };

    const handlePolicyClose = () => {
        // User declined to read/accept — send them back rather than
        // leaving them on a signup form they can't submit
        navigate("/login");
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.username.trim())
            newErrors.username = "Username is required";
        if (!formData.firstname.trim())
            newErrors.firstname = "First name is required";
        if (!formData.lastname.trim())
            newErrors.lastname = "Last name is required";

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters";
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        if (!formData.consent) {
            newErrors.consent =
                "You must agree to the Privacy Policy to sign up";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError("");

        if (!validate()) return;

        setIsSubmitting(true);
        try {
            const response = await AuthService.register({
                requestBody: {
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    firstname: formData.firstname,
                    lastname: formData.lastname,
                    consent: formData.consent,
                },
            });

            const loginResponse = await AuthService.login({
                requestBody: {
                    email: formData.email,
                    password: formData.password,
                },
            });

            setUser(loginResponse.user ?? response.user);
            navigate("/", { replace: true });
        } catch (error) {
            if (error instanceof ApiError) {
                setApiError(
                    error.body?.error ||
                        "Could not create your account. Please try again.",
                );
            } else {
                setApiError(
                    "Could not connect to the server. Please try again.",
                );
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-secondary px-4 py-12">
            <PrivacyPolicyModal
                open={showPolicyModal}
                onAccept={handlePolicyAccept}
                onClose={handlePolicyClose}
            />
            <div className="w-full max-w-sm bg-background rounded-2xl shadow-sm border border-gray-100 p-8">
                {/* Tab Switch */}
                <div className="flex justify-center mb-8">
                    <div className="inline-flex bg-secondary rounded-xl p-1 gap-1">
                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all text-text-muted hover:text-text-main"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="w-4 h-4"
                            >
                                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                                <path d="M10 17l5-5-5-5" />
                                <path d="M15 12H3" />
                            </svg>
                            Login
                        </button>
                        <button
                            type="button"
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all bg-background text-text-main shadow-sm"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="w-4 h-4"
                            >
                                <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                            </svg>
                            Sign Up
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <div>
                        <label className="block text-sm font-medium text-text-main mb-2">
                            Username
                        </label>
                        <input
                            name="username"
                            type="text"
                            placeholder="Choose a username"
                            value={formData.username}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            className={`w-full px-4 py-2.5 rounded-lg border text-sm text-text-main placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                                errors.username
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-gray-200 focus:ring-primary"
                            }`}
                        />
                        {errors.username && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.username}
                            </p>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-text-main mb-2">
                                First Name
                            </label>
                            <input
                                name="firstname"
                                type="text"
                                placeholder="First name"
                                value={formData.firstname}
                                onChange={handleChange}
                                disabled={isSubmitting}
                                className={`w-full px-4 py-2.5 rounded-lg border text-sm text-text-main placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                                    errors.firstname
                                        ? "border-red-500 focus:ring-red-500"
                                        : "border-gray-200 focus:ring-primary"
                                }`}
                            />
                            {errors.firstname && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.firstname}
                                </p>
                            )}
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-text-main mb-2">
                                Last Name
                            </label>
                            <input
                                name="lastname"
                                type="text"
                                placeholder="Last name"
                                value={formData.lastname}
                                onChange={handleChange}
                                disabled={isSubmitting}
                                className={`w-full px-4 py-2.5 rounded-lg border text-sm text-text-main placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                                    errors.lastname
                                        ? "border-red-500 focus:ring-red-500"
                                        : "border-gray-200 focus:ring-primary"
                                }`}
                            />
                            {errors.lastname && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.lastname}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-main mb-2">
                            Email Address
                        </label>
                        <input
                            name="email"
                            type="email"
                            autoComplete="email"
                            placeholder="Enter Your Email Address"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            className={`w-full px-4 py-2.5 rounded-lg border text-sm text-text-main placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                                errors.email
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-gray-200 focus:ring-primary"
                            }`}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-main mb-2">
                            Password
                        </label>
                        <input
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            placeholder="Enter Your Password"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            className={`w-full px-4 py-2.5 rounded-lg border text-sm text-text-main placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                                errors.password
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-gray-200 focus:ring-primary"
                            }`}
                        />
                        {errors.password && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-main mb-2">
                            Re-enter Password
                        </label>
                        <input
                            name="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            placeholder="Re-enter Your Password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            className={`w-full px-4 py-2.5 rounded-lg border text-sm text-text-main placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                                errors.confirmPassword
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-gray-200 focus:ring-primary"
                            }`}
                        />
                        {errors.confirmPassword && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.confirmPassword}
                            </p>
                        )}
                    </div>

                    {apiError && (
                        <p className="text-sm text-red-600" role="alert">
                            {apiError}
                        </p>
                    )}

                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full mt-8"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Creating Account..." : "Sign Up"}
                    </Button>
                </form>
            </div>
        </div>
    );
}

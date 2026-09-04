import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Button from "../../components/ui/Button";
import PasswordInput from "../../components/ui/PasswordInput";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginPage = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(location.state?.tab === "signup" ? "signup" : "login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState({});

    const switchTab = (tab) => {
        setActiveTab(tab);
        setErrors({}); // don't carry stale errors between login/signup
    };

    const validate = () => {
        const newErrors = {};

        if (!email.trim()) {
            newErrors.email = "Email is required";
        } else if (!emailRegex.test(email)) {
            newErrors.email = "Please enter a valid email address";
        }

        if (!password.trim()) {
            newErrors.password = "Password is required";
        } else if (password.length < 8) {
            newErrors.password = "Password must be at least 8 characters";
        }

        if (activeTab === "signup") {
            if (!confirmPassword.trim()) {
                newErrors.confirmPassword = "Please re-enter your password";
            } else if (password !== confirmPassword) {
                newErrors.confirmPassword = "Passwords do not match";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        if (activeTab === "login") {
            // mockup เฉยๆ ยังไม่มี logic
            console.log("login clicked (mockup only)", { email, password });
        } else {
            // mockup เฉยๆ ยังไม่มี logic
            console.log("signup clicked (mockup only)", { email, password, confirmPassword });
        }
    };

    const clearFieldError = (field) => {
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        clearFieldError("email");
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        clearFieldError("password");
    };

    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value);
        clearFieldError("confirmPassword");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-secondary px-4">
            <div className="w-full max-w-sm bg-background rounded-2xl shadow-sm border border-gray-100 p-8">
                {/* Tab Switch */}
                <div className="flex justify-center mb-8">
                    <div className="inline-flex bg-secondary rounded-xl p-1 gap-1">
                        <button
                            type="button"
                            onClick={() => switchTab("login")}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                activeTab === "login"
                                    ? "bg-background text-text-main shadow-sm"
                                    : "text-text-muted hover:text-text-main"
                            }`}
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
                            onClick={() => switchTab("signup")}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                activeTab === "signup"
                                    ? "bg-background text-text-main shadow-sm"
                                    : "text-text-muted hover:text-text-main"
                            }`}
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

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-text-main mb-2"
                        >
                            Email Address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            placeholder="Enter Your Email Address"
                            value={email}
                            onChange={handleEmailChange}
                            className={`w-full px-4 py-2.5 rounded-lg border text-sm text-text-main placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                                errors.email
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-gray-200 focus:ring-primary"
                            }`}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                        )}
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-text-main"
                            >
                                Password
                            </label>
                            {activeTab === "login" && (
                                <button
                                    type="button"
                                    className="text-sm text-text-muted hover:text-primary transition-colors"
                                >
                                    Forgot Password?
                                </button>
                            )}
                        </div>
                        <PasswordInput
                            id="password"
                            name="password"
                            placeholder="Enter Your Password"
                            value={password}
                            onChange={handlePasswordChange}
                            error={errors.password}
                        />
                        {errors.password && (
                            <p className="text-red-500 text-xs mt-1 leading-tight">{errors.password}</p>
                        )}
                    </div>

                    {activeTab === "signup" && (
                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="block text-sm font-medium text-text-main mb-2"
                            >
                                Re-enter Password
                            </label>
                            <PasswordInput
                                id="confirmPassword"
                                name="confirmPassword"
                                placeholder="Re-enter Your Password"
                                value={confirmPassword}
                                onChange={handleConfirmPasswordChange}
                                error={errors.confirmPassword}
                            />
                            {errors.confirmPassword && (
                                <p className="text-red-500 text-xs mt-1 leading-tight">{errors.confirmPassword}</p>
                            )}
                        </div>
                    )}

                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full mt-3"
                        type="submit"
                    >
                        {activeTab === "login" ? "Log In" : "Sign Up"}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
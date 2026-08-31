import { useState } from "react";
import Button from "../../../components/ui/Button";

function EyeIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}

function EyeOffIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
            <line x1="2" x2="22" y1="2" y2="22" />
        </svg>
    );
}

export default function PasswordPage({ formData, handleChange, onBack, onNext }) {
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const validate = () => {
        const newErrors = {};

        if (!formData.password?.trim()) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters";
        }

        if (!formData.confirmPassword?.trim()) {
            newErrors.confirmPassword = "Please re-enter your password";
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = (e) => {
        e.preventDefault();
        if (validate()) {
            onNext();
        }
    };

    const handleFieldChange = (e) => {
        handleChange(e);
        if (errors[e.target.name]) {
            setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-secondary px-4">
            <div className="w-full max-w-sm min-h-[475px] bg-background rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col">
                
                {/* Header */}
                <h1 className="text-xl text-text-main mb-8 text-center">
                    Enter Your Password
                </h1>

                {/* Form */}
                <form className="flex flex-col flex-1 space-y-5" onSubmit={handleNext} noValidate>
                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-text-main mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <input 
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Enter Your Password"
                                value={formData.password}
                                onChange={handleFieldChange}
                                className={`w-full px-4 py-2.5 pr-11 rounded-lg border text-sm text-text-main placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                                    errors.password ? "border-red-500 focus:ring-red-500" : "border-gray-200 focus:ring-primary"
                                }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-red-500 text-xs mt-1 leading-tight">{errors.password}</p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-text-main mb-2">
                            Re-enter Password
                        </label>
                        <div className="relative">
                            <input 
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                placeholder="Re-enter Your Password"
                                value={formData.confirmPassword}
                                onChange={handleFieldChange}
                                className={`w-full px-4 py-2.5 pr-11 rounded-lg border text-sm text-text-main placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                                    errors.confirmPassword ? "border-red-500 focus:ring-red-500" : "border-gray-200 focus:ring-primary"
                                }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                tabIndex={-1}
                            >
                                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-red-500 text-xs mt-1 leading-tight">{errors.confirmPassword}</p>
                        )}
                    </div>

                    {/* Button Container */}
                    <div className="flex gap-3 mt-auto">
                        <Button 
                            variant="secondary"
                            className="flex-1"
                            type="button"
                            onClick={onBack}
                        >
                            ← Back
                        </Button>
                        <Button 
                            variant="primary"
                            className="flex-1"
                            type="submit"
                        >
                            Confirm
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
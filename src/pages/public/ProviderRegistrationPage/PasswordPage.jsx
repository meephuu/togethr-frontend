import { useState } from "react";
import Button from "../../../components/ui/Button";
import PasswordInput from "../../../components/ui/PasswordInput";

export default function PasswordPage({ formData, handleChange, onBack, onNext, isSubmitting, apiError }) {
    const [errors, setErrors] = useState({});

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
            onNext(e);
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
            <div className="w-full max-w-sm min-h-[420px] bg-background rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col">

                {/* Header */}
                <h1 className="text-xl text-text-main mb-8 text-center">
                    Enter Your Password
                </h1>

                {/* Form */}
                <form className="flex flex-col flex-1 space-y-5" onSubmit={handleNext} noValidate>
                    <PasswordInput
                        label="Password"
                        name="password"
                        placeholder="Enter Your Password"
                        value={formData.password}
                        onChange={handleFieldChange}
                        error={errors.password}
                        autoComplete="new-password"
                    />

                    <PasswordInput
                        label="Re-enter Password"
                        name="confirmPassword"
                        placeholder="Re-enter Your Password"
                        value={formData.confirmPassword}
                        onChange={handleFieldChange}
                        error={errors.confirmPassword}
                        autoComplete="new-password"
                    />

                    {apiError && (
                        <p className="text-red-500 text-xs" role="alert">{apiError}</p>
                    )}

                    {/* Button Container — pinned to the bottom of the card */}
                    <div className="flex gap-3 mt-auto pt-8">
                        <Button
                            variant="secondary"
                            className="flex-1"
                            type="button"
                            onClick={onBack}
                            disabled={isSubmitting}
                        >
                            ← Back
                        </Button>
                        <Button
                            variant="primary"
                            className="flex-1"
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Submitting..." : "Confirm"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
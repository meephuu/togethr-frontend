import { useState } from "react";
import Button from "../../../components/ui/Button";
import PasswordInput from "../../../components/ui/PasswordInput";

export default function PasswordPage({ formData, handleChange, onBack, onNext }) {
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
                        <PasswordInput
                            name="password"
                            placeholder="Enter Your Password"
                            value={formData.password}
                            onChange={handleFieldChange}
                            error={errors.password}
                        />
                        {errors.password && (
                            <p className="text-red-500 text-xs mt-1 leading-tight">{errors.password}</p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-text-main mb-2">
                            Re-enter Password
                        </label>
                        <PasswordInput
                            name="confirmPassword"
                            placeholder="Re-enter Your Password"
                            value={formData.confirmPassword}
                            onChange={handleFieldChange}
                            error={errors.confirmPassword}
                        />
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
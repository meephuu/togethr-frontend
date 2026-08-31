import { useState } from "react";
import Button from "../../../components/ui/Button";

export default function PasswordPage({ formData, handleChange, onBack, onNext }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-secondary px-4">
            <div className="w-full max-w-sm h-[475px] bg-background rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col">
                
                {/* Header */}
                <h1 className="text-2xl font-bold text-text-main mb-8 text-center">
                    Enter Your Password
                </h1>

                {/* Form */}
                <form className="flex flex-col flex-1 space-y-5">
                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-text-main mb-2">
                            Password
                        </label>
                        <input 
                            type="password" 
                            name="password"
                            placeholder="Enter Your Password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-text-main placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-text-main mb-2">
                            Re-enter Password
                        </label>
                        <input 
                            type="password" 
                            name="confirmPassword"
                            placeholder="Re-enter Your Password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-text-main placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                    </div>

                    {/* Button Container */}
                    <div className="flex gap-3 mt-auto">
                        <Button 
                            variant="secondary"
                            className="flex-1"
                            onClick={onBack}
                        >
                            ← Back
                        </Button>
                        <Button 
                            variant="primary"
                            className="flex-1"
                            onClick={onNext}
                        >
                            Confirm
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
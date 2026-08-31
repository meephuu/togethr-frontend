import { useState } from "react";
import Button from "../../../components/ui/Button";

export default function AdditionalInfoPage({ formData, handleChange, onBack, onNext }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-secondary px-4">
            <div className="w-full max-w-sm h-[475px] bg-background rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col">
                
                {/* Header */}
                <h1 className="text-2xl font-bold text-text-main mb-8 text-center">
                    Additional Information
                </h1>

                {/* Form */}
                <form className="flex flex-col flex-1 space-y-5">
                    {/* National ID */}
                    <div>
                        <label className="block text-sm font-medium text-text-main mb-2">
                            National ID
                        </label>
                        <input 
                            type="text" 
                            name="nationalId"
                            placeholder="Enter National ID"
                            value={formData.nationalId}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-text-main placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                    </div>

                    {/* Spoken Languages */}
                    <div>
                        <label className="block text-sm font-medium text-text-main mb-2">
                            Spoken Languages
                        </label>
                        <input 
                            type="text" 
                            name="languages"
                            placeholder="e.g. English, Thai"
                            value={formData.languages}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-text-main placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                    </div>

                    {/* Emergency Contact */}
                    <div>
                        <label className="block text-sm font-medium text-text-main mb-2">
                            Emergency Contact
                        </label>
                        <input 
                            type="text" 
                            name="emergencyContact"
                            placeholder="Phone number"
                            value={formData.emergencyContact}
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
                            Next ➝
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
import { useState } from "react";
import Button from "../../../components/ui/Button";

export default function AdditionalInfoPage({ formData, handleChange, onBack, onNext }) {
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};

        if (!formData.nationalId?.trim()) {
            newErrors.nationalId = "National ID is required";
        } else if (!/^\d{13}$/.test(formData.nationalId.trim())) {
            newErrors.nationalId = "National ID must be 13 digits";
        }

        if (!formData.languages?.trim()) {
            newErrors.languages = "Please enter at least one language";
        }

        if (!formData.emergencyContact?.trim()) {
            newErrors.emergencyContact = "Emergency contact is required";
        } else if (!/^[0-9+\-\s]{9,15}$/.test(formData.emergencyContact.trim())) {
            newErrors.emergencyContact = "Please enter a valid phone number";
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
                    Additional Information
                </h1>

                {/* Form */}
                <form className="flex flex-col flex-1 space-y-5" onSubmit={handleNext} noValidate>
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
                            onChange={handleFieldChange}
                            className={`w-full px-4 py-2.5 rounded-lg border text-sm text-text-main placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                                errors.nationalId ? "border-red-500 focus:ring-red-500" : "border-gray-200 focus:ring-primary"
                            }`}
                        />
                        {errors.nationalId && (
                            <p className="text-red-500 text-xs mt-1">{errors.nationalId}</p>
                        )}
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
                            onChange={handleFieldChange}
                            className={`w-full px-4 py-2.5 rounded-lg border text-sm text-text-main placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                                errors.languages ? "border-red-500 focus:ring-red-500" : "border-gray-200 focus:ring-primary"
                            }`}
                        />
                        {errors.languages && (
                            <p className="text-red-500 text-xs mt-1">{errors.languages}</p>
                        )}
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
                            onChange={handleFieldChange}
                            className={`w-full px-4 py-2.5 rounded-lg border text-sm text-text-main placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                                errors.emergencyContact ? "border-red-500 focus:ring-red-500" : "border-gray-200 focus:ring-primary"
                            }`}
                        />
                        {errors.emergencyContact && (
                            <p className="text-red-500 text-xs mt-1">{errors.emergencyContact}</p>
                        )}
                    </div>

                    {/* Button Container */}
                    <div className="flex gap-3 mt-8">
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
                            Next ➝
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
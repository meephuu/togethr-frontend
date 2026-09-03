import { useState } from "react";
import Button from "../../../components/ui/Button";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function PersonalInfoPage({ formData, handleChange, onBack, onNext }) {
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};

        if (!formData.username?.trim()) {
            newErrors.username = "Username is required";
        }

        if (!formData.firstName?.trim()) {
            newErrors.firstName = "First name is required";
        }

        if (!formData.lastName?.trim()) {
            newErrors.lastName = "Last name is required";
        }

        if (!formData.email?.trim()) {
            newErrors.email = "Email is required";
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = (e) => {
        e.preventDefault();
        if (validate()) {
            onNext();
        }
        // if validate() returns false, errors state is already set — nothing more to do
    };

    // Clear a field's error as soon as the user starts fixing it
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
                    Register as a Provider
                </h1>

                {/* Form */}
                <form className="flex flex-col flex-1 space-y-5" onSubmit={handleNext} noValidate>
                    {/* Username */}
                    <div>
                        <label className="block text-sm font-medium text-text-main mb-2">
                            Username
                        </label>
                        <input
                            type="text"
                            name="username"
                            placeholder="Choose a username"
                            value={formData.username}
                            onChange={handleFieldChange}
                            className={`w-full px-4 py-2.5 rounded-lg border text-sm text-text-main placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                                errors.username ? "border-red-500 focus:ring-red-500" : "border-gray-200 focus:ring-primary"
                            }`}
                        />
                        {errors.username && (
                            <p className="text-red-500 text-xs mt-1">{errors.username}</p>
                        )}
                    </div>

                    {/* First Name */}
                    <div>
                        <label className="block text-sm font-medium text-text-main mb-2">
                            First Name
                        </label>
                        <input 
                            type="text" 
                            name="firstName"
                            placeholder="Enter Your First Name"
                            value={formData.firstName}
                            onChange={handleFieldChange}
                            className={`w-full px-4 py-2.5 rounded-lg border text-sm text-text-main placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                                errors.firstName ? "border-red-500 focus:ring-red-500" : "border-gray-200 focus:ring-primary"
                            }`}
                        />
                        {errors.firstName && (
                            <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                        )}
                    </div>

                    {/* Last Name */}
                    <div>
                        <label className="block text-sm font-medium text-text-main mb-2">
                            Last Name
                        </label>
                        <input 
                            type="text" 
                            name="lastName"
                            placeholder="Enter Your Last Name"
                            value={formData.lastName}
                            onChange={handleFieldChange}
                            className={`w-full px-4 py-2.5 rounded-lg border text-sm text-text-main placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                                errors.lastName ? "border-red-500 focus:ring-red-500" : "border-gray-200 focus:ring-primary"
                            }`}
                        />
                        {errors.lastName && (
                            <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-text-main mb-2">
                            Email Address
                        </label>
                        <input 
                            type="email" 
                            name="email"
                            placeholder="Enter Your Email Address"
                            value={formData.email}
                            onChange={handleFieldChange}
                            className={`w-full px-4 py-2.5 rounded-lg border text-sm text-text-main placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                                errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-200 focus:ring-primary"
                            }`}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                        )}
                    </div>

                    {/* Next Button */}
                    <div className="flex gap-3 mt-auto">
                        <Button 
                            variant="primary" 
                            className="w-full"
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
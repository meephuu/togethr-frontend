import { useState } from "react";
import Button from "../../../components/ui/Button";

export default function PersonalInfoPage({ formData, handleChange, onBack, onNext }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-secondary px-4">
            <div className="w-full max-w-sm h-[475px] bg-background rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col">
                
                {/* Header */}
                <h1 className="text-2xl font-bold text-text-main mb-8 text-center">
                    Register as a Provider
                </h1>

                {/* Form */}
                <form className="flex flex-col flex-1 space-y-5">
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
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-text-main placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
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
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-text-main placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
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
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-text-main placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                    </div>

                    {/* Next Button */}
                    <div className="flex gap-3 mt-auto">
                        <Button 
                            variant="primary" 
                            className="w-full"
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
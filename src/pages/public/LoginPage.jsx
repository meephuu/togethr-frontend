import React, { useState } from "react";
import Button from "../../components/ui/Button";

const LoginPage = () => {
    const [activeTab, setActiveTab] = useState("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        // mockup เฉยๆ ยังไม่มี logic
        console.log("login clicked (mockup only)", { email, password });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-secondary px-4">
            <div className="w-full max-w-sm bg-background rounded-2xl shadow-sm border border-gray-100 p-8">
                {/* Tab Switch */}
                <div className="flex justify-center mb-8">
                    <div className="inline-flex bg-secondary rounded-xl p-1 gap-1">
                        <button
                            type="button"
                            onClick={() => setActiveTab("login")}
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
                            onClick={() => setActiveTab("signup")}
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
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-text-main mb-2"
                        >
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Enter Your Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-text-main placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-text-main"
                            >
                                Password
                            </label>
                            <button
                                type="button"
                                className="text-sm text-text-muted hover:text-primary transition-colors"
                            >
                                Forgot Password?
                            </button>
                        </div>
                        <input
                            id="password"
                            type="password"
                            placeholder="Enter Your Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-text-main placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                    </div>

                    <Button
                        variant="primary"
                        className="w-full mt-3"
                        onClick={handleSubmit}
                    >
                        Log In
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;

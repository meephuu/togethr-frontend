import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import { useAuth } from "../../hooks/useAuth";
import { ApiError, AuthService } from "../../services/generated";
import PasswordInput from "../../components/ui/PasswordInput";

const LoginPage = () => {
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");
        setIsSubmitting(true);

        try {
            const response = await AuthService.login({
                requestBody: { email, password },
            });

            setUser(response.user);
            navigate("/", { replace: true });
        } catch (error) {
            if (error instanceof ApiError) {
                setErrorMessage(
                    error.body?.error || "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
                );
            } else {
                setErrorMessage(
                    "Could not connect to the server. Please try again.",
                );
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-secondary px-4">
            <div className="w-full max-w-sm bg-background rounded-2xl shadow-sm border border-gray-100 p-8">
                {/* Tab Switch */}
                <div className="flex justify-center mb-8">
                    <div className="inline-flex bg-secondary rounded-xl p-1 gap-1">
                        <button
                            type="button"
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all bg-background text-text-main shadow-sm"
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
                            onClick={() => navigate("/sign-up")}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all text-text-muted hover:text-text-main"
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
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isSubmitting}
                            required
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-text-main placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                    </div>

                    <PasswordInput
                        label="Password"
                        labelAction={
                            <button
                                type="button"
                                className="text-sm text-text-muted hover:text-primary transition-colors"
                            >
                                Forgot Password?
                            </button>
                        }
                        name="password"
                        placeholder="Enter Your Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isSubmitting}
                        autoComplete="current-password"
                    />

                    {errorMessage && (
                        <p className="text-sm text-red-600" role="alert">
                            {errorMessage}
                        </p>
                    )}

                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full mt-3"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Logging In..." : "Log In"}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
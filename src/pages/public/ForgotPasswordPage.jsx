import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import { CheckIcon } from "../../components/ui/Icons";
import { ApiError, AuthService } from "../../services/generated";
import { ERROR_TEXT_CLASS, LABEL_CLASS, inputClass } from "../../lib/styles";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// US1-5: asks for a reset link. The server answers the same whether or not
// the email is registered, so this page does too.
export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [apiError, setApiError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sentTo, setSentTo] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError("");

        const trimmed = email.trim();
        if (!trimmed) {
            setEmailError("Email is required");
            return;
        }
        if (!emailRegex.test(trimmed)) {
            setEmailError("Please enter a valid email address");
            return;
        }
        setEmailError("");

        setIsSubmitting(true);
        try {
            await AuthService.forgotPassword({ requestBody: { email: trimmed } });
            setSentTo(trimmed);
        } catch (error) {
            if (error instanceof ApiError) {
                setApiError(
                    error.body?.error ||
                        "Could not send the reset link. Please try again.",
                );
            } else {
                setApiError("Could not connect to the server. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-secondary px-4 py-12">
            <div className="w-full max-w-sm bg-background rounded-2xl shadow-sm border border-gray-100 p-8">
                {sentTo ? (
                    <div className="flex flex-col items-center gap-4 text-center">
                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                            <CheckIcon size={28} />
                        </span>
                        <h1 className="text-xl text-text-main">Check your email</h1>
                        <p className="text-sm leading-normal text-text-main" role="status">
                            If <strong className="font-semibold">{sentTo}</strong> is
                            registered, we&apos;ve sent a link to reset your password.
                        </p>
                        <p className="text-xs leading-normal text-text-muted">
                            The link works once and expires in 15 minutes. If
                            nothing arrives, check your spam folder or try again.
                        </p>
                        <div className="mt-2 flex w-full flex-col gap-3">
                            <Button
                                variant="primary"
                                className="w-full"
                                onClick={() => navigate("/login")}
                            >
                                Back to log in
                            </Button>
                            <Button
                                variant="secondary"
                                className="w-full"
                                onClick={() => setSentTo("")}
                            >
                                Use a different email
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        <h1 className="text-xl text-text-main text-center">
                            Forgot your password?
                        </h1>
                        <p className="mt-2 mb-6 text-sm leading-normal text-text-muted text-center">
                            Enter the email you registered with and we&apos;ll send
                            you a link to choose a new password.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                            <div>
                                <label htmlFor="email" className={LABEL_CLASS}>
                                    Email
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="Enter Your Email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setEmailError("");
                                    }}
                                    disabled={isSubmitting}
                                    aria-invalid={Boolean(emailError)}
                                    aria-describedby={emailError ? "email-error" : undefined}
                                    className={inputClass(Boolean(emailError))}
                                />
                                {emailError && (
                                    <p id="email-error" className={ERROR_TEXT_CLASS}>
                                        {emailError}
                                    </p>
                                )}
                            </div>

                            {apiError && (
                                <p className="text-sm text-red-600" role="alert">
                                    {apiError}
                                </p>
                            )}

                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Sending..." : "Send reset link"}
                            </Button>
                        </form>

                        <p className="mt-6 text-center text-sm text-text-muted">
                            Remembered it?{" "}
                            <Link
                                to="/login"
                                className="font-medium text-primary hover:underline"
                            >
                                Back to log in
                            </Link>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}

import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Button from "../../components/ui/Button";
import PasswordInput from "../../components/ui/PasswordInput";
import { AlertCircleIcon } from "../../components/ui/Icons";
import { ApiError, AuthService } from "../../services/generated";

// US1-5: sets a new password with the token from the emailed link
// (/reset-password?token=...). The server rejects an unknown, expired or used
// token with 400, which shows the "link invalid" state.
export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") ?? "";

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState("");
    const [linkInvalid, setLinkInvalid] = useState(!token);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validate = () => {
        const newErrors = {};
        if (!password) {
            newErrors.password = "Password is required";
        } else if (password.length < 8) {
            newErrors.password = "Password must be at least 8 characters";
        }
        if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError("");
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            await AuthService.resetPassword({ requestBody: { token, password } });
            navigate("/login", { replace: true, state: { passwordReset: true } });
        } catch (error) {
            if (error instanceof ApiError && error.status === 400) {
                setLinkInvalid(true);
            } else if (error instanceof ApiError) {
                setApiError(
                    error.body?.error ||
                        "Could not reset your password. Please try again.",
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
                {linkInvalid ? (
                    <div className="flex flex-col items-center gap-4 text-center">
                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
                            <AlertCircleIcon size={28} />
                        </span>
                        <h1 className="text-xl text-text-main">
                            This link isn&apos;t valid
                        </h1>
                        <p className="text-sm leading-normal text-text-muted" role="alert">
                            The reset link is invalid, has expired, or has
                            already been used. Your password has not been
                            changed.
                        </p>
                        <div className="mt-2 flex w-full flex-col gap-3">
                            <Button
                                variant="primary"
                                className="w-full"
                                onClick={() => navigate("/forgot-password")}
                            >
                                Request a new link
                            </Button>
                            <Button
                                variant="secondary"
                                className="w-full"
                                onClick={() => navigate("/login")}
                            >
                                Back to log in
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        <h1 className="text-xl text-text-main text-center">
                            Set a new password
                        </h1>
                        <p className="mt-2 mb-6 text-sm leading-normal text-text-muted text-center">
                            Choose a password of at least 8 characters.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                            <PasswordInput
                                label="New password"
                                name="password"
                                placeholder="Enter Your New Password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setErrors((prev) => ({ ...prev, password: undefined }));
                                }}
                                error={errors.password}
                                disabled={isSubmitting}
                                autoComplete="new-password"
                            />
                            <PasswordInput
                                label="Confirm new password"
                                name="confirmPassword"
                                placeholder="Re-enter Your New Password"
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                                }}
                                error={errors.confirmPassword}
                                disabled={isSubmitting}
                                autoComplete="new-password"
                            />

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
                                {isSubmitting ? "Saving..." : "Reset password"}
                            </Button>
                        </form>

                        <p className="mt-6 text-center text-sm text-text-muted">
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

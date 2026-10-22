import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/ui/Navbar";
import Footer from "../../components/ui/Footer";
import Button from "../../components/ui/Button";
import { CheckIcon } from "../../components/ui/Icons";
import { CARD_CLASS } from "../../lib/styles";

// Shown after DELETE /api/users/me succeeds (US2-3). The email comes in the
// navigation state; after a refresh it's gone, so fall back to "your old address".
export default function AccountDeletedPage() {
    const navigate = useNavigate();
    const email = useLocation().state?.email;

    // We arrive from the bottom of the profile page; start at the top
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="max-w-lg mx-auto px-4 py-24">
                <section className={`${CARD_CLASS} flex flex-col items-center gap-4 px-8 py-10 text-center`}>
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                        <CheckIcon size={28} />
                    </span>
                    <h1 className="text-2xl text-text-main">Your account has been deleted</h1>
                    <p className="text-base text-text-main">
                        We've sent a confirmation email to{" "}
                        {email ? <strong className="font-semibold">{email}</strong> : "your old address"}.
                    </p>
                    <p className="text-sm leading-normal text-text-muted">
                        Past bookings and reviews stay on Togethr as “Deleted User”. You can sign up again with the
                        same email whenever you like.
                    </p>
                    <div className="mt-2 flex gap-3">
                        <Button variant="primary" onClick={() => navigate("/")}>Back to home</Button>
                        <Button variant="secondary" onClick={() => navigate("/sign-up")}>Sign up</Button>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

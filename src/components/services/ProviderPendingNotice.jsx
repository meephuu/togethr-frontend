import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import { ClockIcon } from "../ui/Icons";
import { CARD_CLASS } from "../../lib/styles";

// Shown instead of the create-service form while the provider isn't approved.
export default function ProviderPendingNotice() {
    const navigate = useNavigate();

    return (
        <section
            className={`${CARD_CLASS} flex w-full max-w-[520px] flex-col items-center gap-4 px-6 py-12 text-center sm:px-10`}
        >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-700">
                <ClockIcon size={30} />
            </div>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                Pending approval
            </span>
            <h1 className="text-[22px] text-text-main">You can't create services yet</h1>
            <p className="text-[15px] leading-relaxed text-text-muted">
                We're still reviewing your provider account. Once an admin approves it, you'll be able to publish
                services here. We'll let you know by email.
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
                <Button onClick={() => navigate("/provider/dashboard")}>Back to dashboard</Button>
                <Button variant="secondary" onClick={() => navigate("/profile/edit")}>
                    Complete my profile
                </Button>
            </div>
        </section>
    );
}

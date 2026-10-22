import { startTransition, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import DeleteAccountDialog from "./DeleteAccountDialog";
import { useAuth } from "../../hooks/useAuth";

// US2-3 (F50): the "Delete my account" danger zone at the bottom of the
// profile edit page. The dialog does the confirming and the API call.
export default function DeleteAccountSection({ isProvider }) {
    const navigate = useNavigate();
    const { user, setUser } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef(null);

    const closeDialog = () => {
        setIsOpen(false);
        triggerRef.current?.focus();
    };

    // Same as Navbar's logout after its API call. The server already cleared
    // the cookie, so there's no /auth/logout call. The router applies
    // navigations as a transition; clearing the user in one too makes both land
    // in the same render. Otherwise ProfileEditPage sees the signed-out state
    // first and its "not signed in -> /login" redirect wins.
    const handleDeleted = () => {
        const email = user?.email;
        startTransition(() => setUser(null));
        navigate("/account-deleted", { replace: true, state: { email } });
    };

    const handleSessionEnded = () => {
        setUser(null);
        navigate("/login", { replace: true });
    };

    return (
        <section aria-labelledby="delete-account-heading" className="mt-12 rounded-2xl border border-red-200 bg-white p-6">
            <h2 id="delete-account-heading" className="text-lg text-red-700">Delete my account</h2>
            <p className="mt-2 text-sm leading-normal text-text-muted">
                Your personal details are removed and you're signed out. Past bookings and reviews stay, shown as
                “Deleted User”. You can't undo this.
            </p>
            <button
                ref={triggerRef}
                type="button"
                onClick={() => setIsOpen(true)}
                className="mt-4 inline-flex h-10 items-center rounded-lg border border-gray-200 bg-white px-6 text-base font-medium text-red-700 transition-all duration-200 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
            >
                Delete my account
            </button>

            {isOpen && (
                <DeleteAccountDialog
                    email={user?.email}
                    isProvider={isProvider}
                    onClose={closeDialog}
                    onDeleted={handleDeleted}
                    onSessionEnded={handleSessionEnded}
                />
            )}
        </section>
    );
}

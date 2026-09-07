import { useState } from "react";

export default function PrivacyPolicyModal({ open, onAccept, onClose }) {
    const [checked, setChecked] = useState(false);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-lg max-h-[85vh] bg-white rounded-2xl shadow-xl flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-text-main">
                        Privacy Policy
                    </h2>
                    <p className="text-xs text-text-muted mt-1">
                        Please read the policy below before creating your account.
                    </p>
                </div>

                {/* Scrollable content */}
                <div className="overflow-y-auto px-6 py-4 space-y-4 text-sm text-text-main">
                    <section>
                        <h3 className="font-semibold mb-1">1. Introduction</h3>
                        <p>
                            "Travel Companion Matchmaking System" ("we", "the Platform") is
                            committed to protecting the privacy of every user, whether you
                            are a Customer seeking a travel companion or a Provider offering
                            local expertise. This policy explains how we collect, use,
                            disclose, and protect your personal data in accordance with
                            Thailand's Personal Data Protection Act B.E. 2562 (2019)
                            ("PDPA").
                        </p>
                    </section>

                    <section>
                        <h3 className="font-semibold mb-1">2. Information We Collect</h3>
                        <p className="font-medium mt-2">2.1 All users</p>
                        <ul className="list-disc list-inside">
                            <li>Full name, username, password (stored hashed)</li>
                            <li>Gender, date of birth</li>
                            <li>Phone number</li>
                            <li>Social contact channels — optional</li>
                            <li>Bank account number — optional</li>
                        </ul>
                        <p className="font-medium mt-2">2.2 Providers</p>
                        <ul className="list-disc list-inside">
                            <li>National ID card number</li>
                            <li>Bio and languages spoken</li>
                            <li>Emergency contact information</li>
                        </ul>
                        <p className="font-medium mt-2">2.3 Platform usage</p>
                        <ul className="list-disc list-inside">
                            <li>Booking, payment, cancellation, refund history</li>
                            <li>Chat messages after a successful booking</li>
                            <li>Reviews and ratings</li>
                            <li>Complaint history and resolution records</li>
                        </ul>
                        <p className="font-medium mt-2">2.4 Technical</p>
                        <ul className="list-disc list-inside">
                            <li>IP address, device and browser type</li>
                            <li>Cookies and similar tracking technologies</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="font-semibold mb-1">3. How We Use Your Information</h3>
                        <ul className="list-disc list-inside">
                            <li>Create and verify user accounts</li>
                            <li>Match Customers with Providers</li>
                            <li>Process bookings, payments, deposits, refunds</li>
                            <li>Enable in-app chat, logged for safety and disputes</li>
                            <li>Display reviews and ratings publicly</li>
                            <li>Investigate and resolve complaints</li>
                            <li>Prevent fraud and maintain platform security</li>
                            <li>Comply with legal obligations</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="font-semibold mb-1">4. Disclosure to Third Parties</h3>
                        <p>
                            We do not sell your personal data. It's shared only between
                            matched Customer and Provider (basic contact details), with
                            payment processors, with government authorities when legally
                            required, and via your public Provider profile — which never
                            includes your national ID number, bank account, or phone
                            number.
                        </p>
                    </section>

                    <section>
                        <h3 className="font-semibold mb-1">5. Data Retention</h3>
                        <p>
                            Data is kept only as long as necessary or as required by law.
                            Financial records are retained for a minimum of 5 years. On
                            account deletion, personal data is deleted or anonymized within
                            a reasonable period, except where retention is legally
                            required.
                        </p>
                    </section>

                    <section>
                        <h3 className="font-semibold mb-1">6. Security Measures</h3>
                        <ul className="list-disc list-inside">
                            <li>Passwords stored hashed (bcrypt), unreadable by anyone</li>
                            <li>Restricted access to sensitive data (ID, bank account)</li>
                            <li>Encryption in transit (HTTPS/TLS)</li>
                            <li>Sessions expire after inactivity</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="font-semibold mb-1">7. Your Rights</h3>
                        <p>
                            Under the PDPA, you can access, rectify, withdraw consent,
                            request erasure, object to processing, and lodge a complaint
                            with the PDPC. Exercise these through your account settings or
                            by contacting us.
                        </p>
                    </section>

                    <section>
                        <h3 className="font-semibold mb-1">8. Consent</h3>
                        <p>
                            Before registering, you must confirm you have read and agree to
                            this policy. If consent is not given, we cannot complete your
                            registration.
                        </p>
                    </section>

                    <section>
                        <h3 className="font-semibold mb-1">9. Contact Us</h3>
                        <p>
                            Questions or rights requests can be sent by email, to our Data
                            Protection Officer, or through the in-app Report system.
                        </p>
                    </section>

                    <section>
                        <h3 className="font-semibold mb-1">10. Changes to This Policy</h3>
                        <p>
                            We may update this policy from time to time and will notify you
                            of material changes through an in-app notification.
                        </p>
                    </section>
                </div>

                {/* Footer: checkbox + actions */}
                <div className="px-6 py-4 border-t border-gray-100 space-y-3">
                    <label className="flex items-start gap-2 text-sm text-text-main cursor-pointer">
                        <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => setChecked(e.target.checked)}
                            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span>I have read and agree to the Privacy Policy</span>
                    </label>

                    <div className="flex gap-2 mb-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-text-muted hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            disabled={!checked}
                            onClick={onAccept}
                            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all ${
                                checked
                                    ? "bg-primary hover:opacity-90"
                                    : "bg-gray-300 cursor-not-allowed"
                            }`}
                        >
                            Continue
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
function Section({ number, title, children }) {
    return (
        <section className="mb-8">
            <h2 className="text-lg font-bold text-text-main mb-3">
                {number}. {title}
            </h2>
            <div className="space-y-3 text-text-muted leading-relaxed">
                {children}
            </div>
        </section>
    );
}

export default function PrivacyPolicyContent() {
    return (
        <div>
            <h1 className="text-2xl font-bold text-text-main mb-2">Privacy Policy</h1>
            <p className="text-lg font-semibold text-text-main mb-1">Togethr</p>
            <p className="text-sm text-text-muted mb-8">
                Version 1.0 | Effective from [insert publish date]
            </p>

            <Section number={1} title="Introduction">
                <p>
                    &ldquo;Togethr&rdquo; (&ldquo;we&rdquo;, &ldquo;the Platform&rdquo;) is committed to protecting the
                    privacy of every user, whether you are a Customer seeking a travel companion or a Provider offering
                    local expertise. This policy explains how we collect, use, disclose, and protect your personal data
                    in accordance with Thailand&rsquo;s Personal Data Protection Act B.E. 2562 (2019)
                    (&ldquo;PDPA&rdquo;).
                </p>
                <p>
                    By using our Platform, you confirm that you have read and agreed to this policy. You may withdraw
                    your consent at any time as described in Section 7.
                </p>
            </Section>

            <Section number={2} title="Information We Collect">
                <h3 className="font-semibold text-text-main">2.1 Information all users must provide</h3>
                <ul className="list-disc list-inside space-y-1">
                    <li>Full name, username, password (stored hashed)</li>
                    <li>Gender, date of birth</li>
                    <li>Phone number</li>
                    <li>Social contact channels (Instagram, Line, Facebook) — optional</li>
                    <li>Bank account number — optional (used for financial transactions)</li>
                </ul>

                <h3 className="font-semibold text-text-main pt-3">2.2 Additional information for Providers</h3>
                <ul className="list-disc list-inside space-y-1">
                    <li>National ID card number (for identity verification and user safety)</li>
                    <li>Bio and languages spoken</li>
                    <li>Emergency contact information</li>
                </ul>

                <h3 className="font-semibold text-text-main pt-3">2.3 Platform usage information</h3>
                <ul className="list-disc list-inside space-y-1">
                    <li>Booking, payment, cancellation, and refund history</li>
                    <li>Chat messages between matched Customers and Providers, logged after a successful booking</li>
                    <li>Reviews and ratings given or received</li>
                    <li>Complaint history and resolution records handled by Admin staff</li>
                </ul>

                <h3 className="font-semibold text-text-main pt-3">2.4 Technical information</h3>
                <ul className="list-disc list-inside space-y-1">
                    <li>IP address, device and browser type</li>
                    <li>Cookies and similar tracking technologies (see our separate Cookie Policy for details)</li>
                </ul>
            </Section>

            <Section number={3} title="How We Use Your Information">
                <p>We use your information to:</p>
                <ol className="list-decimal list-inside space-y-1">
                    <li>Create and verify user accounts (Customer/Provider)</li>
                    <li>Match Customers with Providers based on interests, budget, and availability</li>
                    <li>Process bookings, payments, deposits, and refunds under our policy</li>
                    <li>Enable in-app chat between matched parties, logged for safety and dispute review</li>
                    <li>Display reviews and ratings on a Provider&rsquo;s public profile</li>
                    <li>Investigate and resolve complaints via our Admin team</li>
                    <li>Prevent fraud, abuse, and maintain platform security</li>
                    <li>Comply with legal obligations and requests from government authorities</li>
                </ol>
                <p>
                    <span className="font-semibold text-text-main">Legal basis:</span> we process your data based on
                    your consent, the necessity to perform our contract with you (matching and booking services), and
                    our legitimate interests in platform safety and fraud prevention, as permitted under PDPA Section
                    24.
                </p>
            </Section>

            <Section number={4} title="Disclosure to Third Parties">
                <p>We do not sell your personal data. We disclose information only in these cases:</p>
                <ul className="list-disc list-inside space-y-1">
                    <li>
                        <span className="font-semibold text-text-main">Between matched Customer and Provider</span>:
                        basic contact details necessary to coordinate a booking
                    </li>
                    <li>
                        <span className="font-semibold text-text-main">Payment processors</span>: to process
                        transactions
                    </li>
                    <li>
                        <span className="font-semibold text-text-main">Government authorities</span>: when legally
                        required
                    </li>
                    <li>
                        <span className="font-semibold text-text-main">Public profile</span>: some Provider information
                        (name, bio, languages, review score) is shown publicly,{" "}
                        <span className="font-semibold text-text-main">excluding</span> national ID number, bank
                        account, and phone number, which remain hidden from public access
                    </li>
                </ul>
            </Section>

            <Section number={5} title="Data Retention">
                <p>
                    We retain personal data only as long as necessary for the purposes stated above, or as required by
                    law. Financial transaction records are retained for a minimum of 5 years in accordance with Thai
                    accounting law. When you delete your account, personal data is deleted or anonymized within a
                    reasonable period, except where retention is legally required.
                </p>
            </Section>

            <Section number={6} title="Security Measures">
                <ul className="list-disc list-inside space-y-1">
                    <li>Passwords are stored hashed (bcrypt) and are not readable, even by administrators</li>
                    <li>
                        Access to sensitive data (national ID, bank account) is restricted to systems that genuinely
                        require it
                    </li>
                    <li>Data is encrypted in transit (HTTPS/TLS)</li>
                    <li>Sessions expire automatically after a period of inactivity</li>
                </ul>
            </Section>

            <Section number={7} title="Your Rights as a Data Subject">
                <p>Under the PDPA, you have the right to:</p>
                <ul className="list-disc list-inside space-y-1">
                    <li>
                        <span className="font-semibold text-text-main">Access</span> the personal data we hold about you
                    </li>
                    <li>
                        <span className="font-semibold text-text-main">Rectify</span> inaccurate data via your profile
                        settings
                    </li>
                    <li>
                        <span className="font-semibold text-text-main">Withdraw consent</span> previously given, at any
                        time
                    </li>
                    <li>
                        <span className="font-semibold text-text-main">Erasure</span> — request deletion of your account
                        and associated data (except where retention is legally required)
                    </li>
                    <li>
                        <span className="font-semibold text-text-main">Object</span> to processing for certain purposes
                    </li>
                    <li>
                        <span className="font-semibold text-text-main">Lodge a complaint</span> with Thailand&rsquo;s
                        Personal Data Protection Committee (PDPC) if you believe we have violated your rights
                    </li>
                </ul>
                <p>
                    You may exercise these rights through your account settings, or by contacting us using the details
                    in Section 9.
                </p>
            </Section>

            <Section number={8} title="Consent">
                <p>
                    Before registering, you must check a box confirming you have read and agree to this policy. If
                    consent is not given, we cannot complete your registration.
                </p>
            </Section>

            <Section number={9} title="Contact Us">
                <p>For questions about this policy or to exercise your rights, contact:</p>
                <ul className="list-disc list-inside space-y-1">
                    <li>Email: [insert contact email]</li>
                    <li>Data Protection Officer: [insert name/role, if designated]</li>
                    <li>Through the in-app Report system</li>
                </ul>
            </Section>

            <Section number={10} title="Changes to This Policy">
                <p>
                    We may update this policy from time to time. We will notify you of material changes through an
                    in-app notification.
                </p>
            </Section>

            <p className="text-xs text-gray-400 italic pt-4 border-t border-gray-100">
                This document was prepared for Sprint 1 (US2-1). Please have it reviewed by legal counsel or your course
                advisor before actual publication.
            </p>
        </div>
    );
}

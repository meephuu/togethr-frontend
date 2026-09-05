import Navbar from "../../components/ui/Navbar";
import Footer from "../../components/ui/Footer";
import PrivacyPolicyContent from "../../components/PrivacyPolicyContent";

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <div className="max-w-3xl mx-auto px-4 py-16">
                <PrivacyPolicyContent />
            </div>

            <Footer />
        </div>
    );
}

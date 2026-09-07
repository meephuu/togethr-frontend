import Navbar from "../../components/ui/Navbar";

export default function ProviderDashboardPage() {
    return (
        <div className="flex min-h-screen flex-col bg-white">
            <Navbar />
            <div className="flex flex-1 items-center justify-center px-4">
                <h1 className="text-4xl font-bold text-center">
                    You are logged in as a Provider
                </h1>
            </div>
        </div>
    );
}

import { BrowserRouter, Routes, Route } from "react-router-dom";

import RoleRoute from "./RoleRoute";
import LoginPage from "../pages/public/LoginPage";
import ProviderRegistrationPage from "../pages/public/ProviderRegistrationPage/ProviderRegistrationPage";
import HomePage from "../pages/public/HomePage";
import SignUpPage from "../pages/public/SignUpPage";
import PrivacyPolicyPage from "../pages/public/PrivacyPolicyPage";
import PublicProfilePage from "../pages/public/PublicProfilePage";
import ProfileEditPage from "../pages/private/ProfileEditPage";
import DevFiltersPage from "../pages/dev/DevFiltersPage";
import CookieConsentBanner from "../components/CookieConsentBanner";
import CustomerDashboardPage from "../pages/customer/CustomerDashboardPage";
import ProviderDashboardPage from "../pages/provider/ProviderDashboardPage";
import CreateServicePage from "../pages/provider/CreateServicePage";
import MyServicesPage from "../pages/provider/MyServicesPage";
import ServiceDetailPage from "../pages/public/ServiceDetailPage";
import MockScenarioSwitcher from "../components/dev/MockScenarioSwitcher";
import { USE_MOCKS } from "../services/sprint2Api";
import FindServicePage from "../pages/public/FindServicePage";

// ==========================================
// Temp Pages Import
// ==========================================

// Public Pages
const Home = () => <HomePage />;

// ==========================================
// Main Router
// ==========================================

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                {/* public */}
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<FindServicePage />} />
                <Route path="/sign-up" element={<SignUpPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route
                    path="/provider-registration"
                    element={<ProviderRegistrationPage />}
                />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/profile/edit" element={<ProfileEditPage />} />
                <Route path="/profile/:id" element={<PublicProfilePage />} />
                <Route path="/services/:id" element={<ServiceDetailPage />} />

                {/* customer */}
                <Route element={<RoleRoute allowedRole="CUSTOMER" />}>
                    <Route
                        path="/customer/dashboard"
                        element={<CustomerDashboardPage />}
                    />
                </Route>

                {/* provider */}
                <Route element={<RoleRoute allowedRole="PROVIDER" />}>
                    <Route
                        path="/provider/dashboard"
                        element={<ProviderDashboardPage />}
                    />
                    <Route
                        path="/provider/services"
                        element={<MyServicesPage />}
                    />
                    <Route
                        path="/provider/services/new"
                        element={<CreateServicePage />}
                    />
                </Route>

                {/* dev only: filter panel test page until the search page (US5-1) exists */}
                {import.meta.env.DEV && (
                    <Route path="/dev/filters" element={<DevFiltersPage />} />
                )}

                <Route path="*" element={<Home />} />
            </Routes>
            <CookieConsentBanner />
            {USE_MOCKS && <MockScenarioSwitcher />}
        </BrowserRouter>
    );
}

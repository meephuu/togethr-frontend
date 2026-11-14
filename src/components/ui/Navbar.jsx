import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./Button";
import Avatar from "./Avatar";
import { useAuth } from "../../hooks/useAuth";
import { AuthService } from "../../services/generated";
import { dashboardFor } from "../../lib/roles";
import logo from "../../assets/temp-logo-black.png";
import NotificationBell from './NotificationBell'

const loginIcon = (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
    >
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
        <path d="M10 17l5-5-5-5" />
        <path d="M15 12H3" />
    </svg>
);

const signUpIcon = (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
    >
        <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
);

const cameraIcon = (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-camera-icon lucide-camera"
    >
        <path d="M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z" />
        <circle cx="12" cy="13" r="3" />
    </svg>
);

// Hamburger, or an X while the menu is open
function MenuIcon({ open }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {open ? (
                <>
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                </>
            ) : (
                <>
                    <path d="M4 6h16" />
                    <path d="M4 12h16" />
                    <path d="M4 18h16" />
                </>
            )}
        </svg>
    );
}

// children: an optional second row inside the sticky nav, e.g. ProviderTabs.
// Below the sm breakpoint the buttons move into a menu (the bell stays out).
const Navbar = ({ children }) => {
    const navigate = useNavigate();
    const { user, setUser, isAuthenticated } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const menuButtonRef = useRef(null);

    const handleLogout = async () => {
        setMenuOpen(false);
        try {
            await AuthService.logout();
        } catch {
            // clear local session state regardless of network/API errors
        }
        setUser(null);
        navigate("/");
    };

    // From the phone menu: close it, then go
    const goFromMenu = (path) => {
        setMenuOpen(false);
        navigate(path);
    };

    useEffect(() => {
        if (!menuOpen) return undefined;

        const closeOnOutsideClick = (event) => {
            if (!menuRef.current?.contains(event.target)) setMenuOpen(false);
        };
        const closeOnEscape = (event) => {
            if (event.key === "Escape") {
                setMenuOpen(false);
                menuButtonRef.current?.focus();
            }
        };

        document.addEventListener("pointerdown", closeOnOutsideClick);
        document.addEventListener("keydown", closeOnEscape);
        return () => {
            document.removeEventListener("pointerdown", closeOnOutsideClick);
            document.removeEventListener("keydown", closeOnEscape);
        };
    }, [menuOpen]);

    const name = user?.firstname || user?.username;

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50">
            <div className="relative max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-8 py-4">
                <div
                    onClick={() =>
                        navigate(isAuthenticated ? dashboardFor(user) : "/")
                    }
                    className="flex items-center gap-3 cursor-pointer"
                >
                    <img
                        src={logo}
                        alt="Togethr Logo"
                        className="h-12 w-auto object-contain"
                    />
                    <span className="text-2xl font-bold font-heading text-black">
                        togethr
                    </span>
                </div>

                <div className="flex gap-8 items-center">
                    <div className="flex gap-2 sm:gap-4 items-center">
                        {/* sm and up: the full row. `sm:contents` wrappers keep it laid out as before. */}
                        {isAuthenticated ? (
                            <>
                                <span className="hidden sm:flex items-center gap-2 text-text-muted text-sm">
                                    <Avatar
                                        photoUrl={user?.profilePhotoUrl}
                                        firstname={name}
                                        lastname={user?.lastname}
                                        size="sm"
                                    />
                                    Hi, {name}
                                </span>
                                <NotificationBell />
                                <div className="hidden sm:contents">
                                    <Button
                                        onClick={() => navigate("/profile/edit")}
                                        variant="secondary"
                                        className="h-10 whitespace-nowrap"
                                    >
                                        My Profile
                                    </Button>
                                    <Button
                                        onClick={handleLogout}
                                        variant="secondary"
                                        className="h-10 whitespace-nowrap"
                                    >
                                        Logout
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="hidden sm:contents">
                                <Button
                                    onClick={() => navigate("/login")}
                                    variant="secondary"
                                    className="h-10 w-23"
                                    leftIcon={loginIcon}
                                >
                                    Login
                                </Button>
                                <Button
                                    onClick={() => navigate("/sign-up")}
                                    variant="secondary"
                                    className="h-10 w-29 whitespace-nowrap"
                                    leftIcon={signUpIcon}
                                >
                                    Sign Up
                                </Button>
                                <Button
                                    onClick={() =>
                                        navigate("/provider-registration")
                                    }
                                    variant="primary"
                                    className="h-10 whitespace-nowrap"
                                    leftIcon={cameraIcon}
                                >
                                    Register as Provider
                                </Button>
                            </div>
                        )}

                        {/* Below sm: the same actions in a dropdown menu. It sits left of the
                            bell (order-first), so the bell's dropdown, anchored to its right
                            edge, has room to open. */}
                        <div ref={menuRef} className="order-first sm:hidden">
                            <button
                                ref={menuButtonRef}
                                type="button"
                                onClick={() => setMenuOpen((open) => !open)}
                                aria-label={menuOpen ? "Close menu" : "Open menu"}
                                aria-expanded={menuOpen}
                                aria-controls="navbar-mobile-menu"
                                className="rounded-lg p-2 text-text-muted transition hover:bg-secondary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <MenuIcon open={menuOpen} />
                            </button>

                            {menuOpen && (
                                <div
                                    id="navbar-mobile-menu"
                                    className="absolute inset-x-0 top-full z-50 flex flex-col gap-3 border-t border-gray-100 bg-white px-4 py-4 shadow-md"
                                >
                                    {isAuthenticated ? (
                                        <>
                                            <span className="flex items-center gap-2 text-text-muted text-sm">
                                                <Avatar
                                                    photoUrl={user?.profilePhotoUrl}
                                                    firstname={name}
                                                    lastname={user?.lastname}
                                                    size="sm"
                                                />
                                                Hi, {name}
                                            </span>
                                            <Button
                                                onClick={() => goFromMenu("/profile/edit")}
                                                variant="secondary"
                                                className="h-10 w-full"
                                            >
                                                My Profile
                                            </Button>
                                            <Button onClick={handleLogout} variant="secondary" className="h-10 w-full">
                                                Logout
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button
                                                onClick={() => goFromMenu("/login")}
                                                variant="secondary"
                                                className="h-10 w-full"
                                                leftIcon={loginIcon}
                                            >
                                                Login
                                            </Button>
                                            <Button
                                                onClick={() => goFromMenu("/sign-up")}
                                                variant="secondary"
                                                className="h-10 w-full"
                                                leftIcon={signUpIcon}
                                            >
                                                Sign Up
                                            </Button>
                                            <Button
                                                onClick={() => goFromMenu("/provider-registration")}
                                                variant="primary"
                                                className="h-10 w-full"
                                                leftIcon={cameraIcon}
                                            >
                                                Register as Provider
                                            </Button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {children}
        </nav>
    );
};

export default Navbar;

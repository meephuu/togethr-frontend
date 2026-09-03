import { useNavigate } from "react-router-dom";
import Button from "./Button";

const Navbar = (
    {
        //for future customization
    },
) => {
    const navigate = useNavigate();

    return (
        <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-sm sticky top-0 z-50">
            <div
                onClick={() => navigate("/")}
                className="text-2xl font-bold text-blue-600 cursor-pointer"
            >
                (LOGO HERE) Togethr
            </div>

            <div className="flex gap-8 items-center">
                <div className="flex gap-4">
                    <Button
                        onClick={() => navigate("/login")}
                        variant="secondary"
                        className="h-10 w-23"
                        leftIcon={
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
                        }
                    >
                        Login
                    </Button>
                    <Button
                        onClick={() =>
                            navigate("/login", { state: { tab: "signup" } })
                        }
                        variant="secondary"
                        className="h-10 w-29 whitespace-nowrap"
                        leftIcon={
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
                        }
                    >
                        Sign Up
                    </Button>
                    <Button
                        onClick={() => navigate("/provider-registration")}
                        variant="primary"
                        className="h-10  whitespace-nowrap"
                        leftIcon={
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                class="lucide lucide-camera-icon lucide-camera"
                            >
                                <path d="M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z" />
                                <circle cx="12" cy="13" r="3" />
                            </svg>
                        }
                    >
                        Register as Provider
                    </Button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

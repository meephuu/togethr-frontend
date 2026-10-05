import Navbar from "./Navbar";

// Gray page with the Navbar. `centered` is for single-card screens
// (loading, errors, notices); otherwise content sits in the 7xl column.
export default function PageShell({ children, centered = false }) {
    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <Navbar />
            <main
                className={
                    centered
                        ? "flex flex-1 items-center justify-center px-4 py-12"
                        : "mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-16 pt-8 sm:px-8"
                }
            >
                {children}
            </main>
        </div>
    );
}

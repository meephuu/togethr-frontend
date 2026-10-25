import { useEffect, useState } from "react";
import { ThemeContext } from "./theme-context";

const STORAGE_KEY = "theme";

// index.html adds the "dark" class before first paint from the same key, so
// read it back from the document rather than from storage again.
function getInitialTheme() {
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

// Light or dark, remembered per browser (not per account). The "dark" class on
// <html> switches the palette in index.css.
export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(getInitialTheme);

    useEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark");
        try {
            localStorage.setItem(STORAGE_KEY, theme);
        } catch {
            // storage blocked: the choice just won't survive a reload
        }
    }, [theme]);

    const value = {
        theme,
        isDark: theme === "dark",
        setTheme,
        toggleTheme: () => setTheme((prev) => (prev === "dark" ? "light" : "dark")),
    };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

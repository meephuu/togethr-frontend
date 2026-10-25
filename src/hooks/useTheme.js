import { useContext } from "react";
import { ThemeContext } from "../contexts/theme-context";

export const useTheme = () => {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error("useTheme need to call under ThemeProvider only");
    }

    return context;
};

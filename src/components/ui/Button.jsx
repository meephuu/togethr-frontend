import React from "react";

const Button = ({
    children,
    variant = "primary",
    leftIcon,
    rightIcon,
    className = "",
    onClick,
    ...props
}) => {
    const baseStyles =
        "inline-flex items-center justify-center gap-2 px-6 py-2.5 text-base font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

    const variants = {
        primary:
            "bg-primary text-white hover:bg-primary-hover focus:ring-primary",
        secondary:
            "bg-secondary text-text-muted border border-gray-200 hover:bg-gray-200 hover:text-text-main focus:ring-gray-300",
    };

    return (
        <button
            onClick={onClick}
            className={`${baseStyles} ${variants[variant]} ${className}`}
            {...props}
        >
            {leftIcon && <span className="flex items-center">{leftIcon}</span>}

            <span>{children}</span>

            {rightIcon && (
                <span className="flex items-center">{rightIcon}</span>
            )}
        </button>
    );
};

export default Button;
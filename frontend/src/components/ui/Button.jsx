import React from "react";
import { cn } from "../../lib/cn";

const variants = {
  primary: "bg-pink-600 text-white hover:bg-pink-700 focus-visible:ring-pink-500",
  secondary: "bg-pink-200 text-pink-700 hover:bg-pink-300 focus-visible:ring-pink-400",
  ghost: "bg-white text-pink-600 border border-pink-200 hover:bg-pink-50 focus-visible:ring-pink-400",
  danger: "bg-rose-100 text-rose-700 hover:bg-rose-200 focus-visible:ring-rose-400"
};

export default function Button({
  className,
  variant = "primary",
  disabled = false,
  children,
  ...props
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

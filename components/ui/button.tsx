import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", children, disabled, ...props },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-mono font-black uppercase tracking-wider border-2 border-[#080808] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFE500] disabled:pointer-events-none disabled:opacity-50";

    const variants = {
      primary:
        "bg-[#FFE500] text-[#080808] shadow-[3px_3px_0px_#080808] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1.5px_1.5px_0px_#080808] active:translate-x-1 active:translate-y-1 active:shadow-none",
      secondary:
        "bg-white text-[#080808] shadow-[3px_3px_0px_#080808] hover:bg-[#F8F6EC] hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1",
      outline:
        "bg-white text-[#080808] shadow-[2px_2px_0px_#080808] hover:bg-[#FFE500] hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1",
      ghost:
        "border-transparent bg-transparent text-[#080808] shadow-none hover:border-[#080808] hover:bg-white hover:shadow-[2px_2px_0px_#080808]",
      destructive:
        "bg-red-500 text-white shadow-[3px_3px_0px_#080808] hover:bg-red-600 hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1",
    };

    const sizes = {
      sm: "h-8 px-3 text-[11px]",
      md: "h-10 px-4 text-xs",
      lg: "h-12 px-6 text-sm",
      icon: "h-10 w-10 p-2",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "destructive" | "success" | "warning";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center font-mono font-black uppercase text-[10px] tracking-wider border-2 border-[#080808] px-2 py-0.5 shadow-[1.5px_1.5px_0px_#080808]";

  const variants = {
    default: "bg-[#080808] text-white",
    secondary: "bg-[#FFE500] text-[#080808]",
    outline: "bg-white text-[#080808]",
    destructive: "bg-red-200 text-red-950",
    success: "bg-[#B7FF6A] text-[#080808]",
    warning: "bg-[#FFE500] text-[#080808]",
  };

  return (
    <div className={cn(baseStyles, variants[variant], className)} {...props} />
  );
}

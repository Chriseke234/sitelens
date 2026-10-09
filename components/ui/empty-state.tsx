import * as React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[300px] flex-col items-center justify-center border-2 border-dashed border-[#080808] bg-[#F8F6EC]/70 p-8 text-center shadow-[4px_4px_0px_#080808]",
        className
      )}
    >
      {icon && (
        <div className="mb-4 flex items-center justify-center border-2 border-[#080808] bg-white p-3 text-[#080808] shadow-[2px_2px_0px_#080808]">
          {icon}
        </div>
      )}
      <h3 className="font-mono text-base font-black uppercase text-[#080808]">
        {title}
      </h3>
      <p className="mt-2 max-w-sm font-mono text-xs font-bold leading-relaxed text-[#080808]/70">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

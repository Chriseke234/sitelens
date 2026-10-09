import React from "react";
import { LogoIcon } from "@/components/ui/logo";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F6EC] px-4 selection:bg-[#FFE500] selection:text-[#080808]">
      {/* Neo-brutalist centered logo card with gentle float and pulse */}
      <div className="relative flex items-center justify-center border-[3px] border-[#080808] bg-white p-5 shadow-[6px_6px_0px_#080808] animate-bounce duration-1000">
        <LogoIcon className="h-16 w-16 sm:h-20 sm:w-20 animate-pulse duration-700" />
      </div>
    </div>
  );
}

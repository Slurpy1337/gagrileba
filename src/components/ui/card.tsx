import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-[18px] border border-[#0ea5e9]/16 bg-white shadow-[0_18px_45px_rgba(14,165,233,0.12)]", className)} {...props} />;
}

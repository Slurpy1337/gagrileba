import Link from "next/link";
import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-[#0ea5e9] text-white shadow-lg shadow-[#0ea5e9]/22 hover:bg-[#0284c7]",
  accent: "bg-[#0ea5e9] text-white shadow-lg shadow-[#0ea5e9]/22 hover:bg-[#0284c7]",
  dark: "bg-[#0369a1] text-white hover:bg-[#075985]",
  outline: "border border-[#0ea5e9]/35 bg-white text-[#0369a1] hover:border-[#0ea5e9] hover:bg-[#e0f2fe]",
  ghost: "text-[#0369a1] hover:bg-[#e0f2fe]",
};

type Props = {
  variant?: keyof typeof variants;
  size?: "sm" | "md" | "lg" | "icon";
  children: ReactNode;
  className?: string;
};

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
  icon: "h-11 w-11 p-0",
};

export function Button({ variant = "primary", size = "md", className, ...props }: Props & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn("inline-flex items-center justify-center gap-2 rounded-full font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0ea5e9]", variants[variant], sizes[size], className)} {...props} />;
}

export function LinkButton({ variant = "primary", size = "md", className, href, ...props }: Props & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return <Link href={href} className={cn("inline-flex items-center justify-center gap-2 rounded-full font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0ea5e9]", variants[variant], sizes[size], className)} {...props} />;
}

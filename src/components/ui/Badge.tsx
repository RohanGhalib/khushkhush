import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "acid" | "outline" | "danger";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center border-2 px-3 py-1 font-sans text-xs font-bold uppercase transition-colors focus:outline-none",
        {
          "border-transparent bg-pure-white text-void-black": variant === "default",
          "border-transparent bg-acid-green text-void-black": variant === "acid",
          "border-pure-white text-pure-white": variant === "outline",
          "border-transparent bg-red-600 text-pure-white": variant === "danger",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };

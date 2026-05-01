import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap font-twenly text-xl font-bold transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 uppercase tracking-wide",
          {
            "bg-acid-green text-void-black border-2 border-transparent hover:bg-void-black hover:text-acid-green hover:border-acid-green":
              variant === "primary",
            "bg-pure-white text-void-black border-2 border-transparent hover:bg-void-black hover:text-pure-white hover:border-pure-white":
              variant === "secondary",
            "bg-transparent text-pure-white border-2 border-pure-white hover:bg-pure-white hover:text-void-black":
              variant === "outline",
            "bg-transparent text-pure-white hover:text-acid-green": variant === "ghost",
            "h-12 px-6 py-2": size === "default",
            "h-10 px-4 text-lg": size === "sm",
            "h-16 px-10 text-3xl": size === "lg",
            "h-12 w-12": size === "icon",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };

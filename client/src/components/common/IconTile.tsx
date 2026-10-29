import React from "react";
import { LucideIcon } from "lucide-react";

export interface IconTileProps {
  icon: LucideIcon | React.ComponentType<{ className?: string; strokeWidth?: number; "aria-hidden"?: boolean | "true" | "false" }>;
  variant?: "primary" | "warning" | "verified" | "neutral" | "high-risk";
  size?: "sm" | "md" | "lg";
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}

const variantStyles: Record<string, string> = {
  primary: "bg-primary/10 text-primary border-primary/20",
  warning: "bg-warning/15 text-warning border-warning/30",
  verified: "bg-status-verified-bg text-status-verified-fg border-status-verified-border",
  "high-risk": "bg-status-high-risk-bg text-status-high-risk-fg border-status-high-risk-border",
  neutral: "bg-surface-raised text-foreground border-border",
};

const sizeStyles: Record<string, { container: string; icon: string }> = {
  sm: {
    container: "w-8 h-8 rounded-md p-1.5",
    icon: "w-4 h-4",
  },
  md: {
    container: "w-10 h-10 rounded-md p-2",
    icon: "w-5 h-5",
  },
  lg: {
    container: "w-12 h-12 rounded-lg p-2.5",
    icon: "w-6 h-6",
  },
};

export function IconTile({
  icon: Icon,
  variant = "primary",
  size = "md",
  className = "",
  "aria-hidden": ariaHidden = true,
}: IconTileProps) {
  const chosenVariant = variantStyles[variant] || variantStyles.primary;
  const chosenSize = sizeStyles[size] || sizeStyles.md;

  return (
    <div
      className={`inline-flex items-center justify-center border shrink-0 transition-colors ${chosenVariant} ${chosenSize.container} ${className}`}
      aria-hidden={ariaHidden ? "true" : undefined}
    >
      <Icon className={`${chosenSize.icon} shrink-0`} strokeWidth={1.75} aria-hidden="true" />
    </div>
  );
}

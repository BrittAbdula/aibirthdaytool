import * as React from "react"
import { cn } from "@/lib/utils"

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "warm" | "clear"
  hoverEffect?: boolean
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", hoverEffect = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-2xl border backdrop-blur-md transition-all duration-300",
          "bg-white/60 border-white/40 shadow-sm",
          variant === "warm" && "bg-orange-50/50 border-orange-100/50 shadow-orange-100/50",
          variant === "clear" && "bg-white/30 border-white/20",
          hoverEffect && "hover:shadow-lg hover:-translate-y-1 hover:bg-white/70",
          className
        )}
        {...props}
      />
    )
  }
)
GlassCard.displayName = "GlassCard"

export { GlassCard }

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 touch-manipulation min-h-[44px]",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white shadow-md hover:shadow-lg hover:brightness-110 border border-transparent",
        secondary: "bg-[#FFF8F0] text-[#2D2D2D] border border-orange-100 hover:bg-white hover:shadow-md",
        outline: "border-2 border-[#FF6B6B] bg-transparent text-[#FF6B6B] hover:bg-[#FF6B6B]/10",
        ghost: "hover:bg-orange-50 text-[#5A5A5A] hover:text-[#2D2D2D]",
        link: "text-[#FF6B6B] underline-offset-4 hover:underline",
        warm: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-warm hover:shadow-warm-lg hover:-translate-y-0.5",
        soft: "bg-[#FFEEE4] text-[#FF6B6B] hover:bg-[#FFDCC9]",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-xl px-4",
        lg: "h-14 rounded-3xl px-10 text-lg",
        icon: "h-11 w-11",
      },
      animation: {
        none: "",
        pulse: "animate-pulse",
        bounce: "animate-bounce",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "none",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const WarmButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, animation, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, animation, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
WarmButton.displayName = "WarmButton"

export { WarmButton, buttonVariants }

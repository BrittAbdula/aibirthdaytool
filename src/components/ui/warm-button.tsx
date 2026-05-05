import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex min-h-[44px] touch-manipulation items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "border border-transparent bg-primary text-white shadow-sm hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md",
        secondary: "border border-[#F1D6DF] bg-white text-[#202A3D] hover:-translate-y-0.5 hover:border-primary/35 hover:bg-[#FFF1F5] hover:shadow-sm",
        outline: "border border-primary bg-transparent text-primary hover:bg-primary/10",
        ghost: "text-[#525B70] hover:bg-primary/10 hover:text-primary",
        link: "text-primary underline-offset-4 hover:underline",
        warm: "border border-transparent bg-warm-coral text-white shadow-sm hover:-translate-y-0.5 hover:bg-warm-coral/90 hover:shadow-md",
        soft: "bg-[#FFF1F5] text-[#8A2D4C] hover:bg-[#FAD5E0]",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-10 px-4",
        lg: "h-14 px-8 text-base",
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

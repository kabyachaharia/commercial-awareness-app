import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border-2 border-black bg-clip-padding text-sm font-semibold whitespace-nowrap text-black transition-all outline-none select-none focus-visible:ring-2 focus-visible:ring-black/30 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-[#FACC15] text-black hover:bg-[#EAB308]",
        outline:
          "border-2 border-black bg-white text-black hover:bg-gray-100",
        secondary:
          "bg-black text-white hover:bg-black/90",
        ghost:
          "border-transparent bg-transparent text-black hover:border-black hover:bg-[#FACC15]",
        destructive: "bg-red-600 text-white hover:bg-red-500",
        link: "border-transparent bg-transparent p-0 text-black underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 gap-2 px-4",
        xs: "h-8 gap-1.5 px-2 text-xs",
        sm: "h-9 gap-1.5 px-3 text-sm",
        lg: "h-12 gap-2.5 px-6 text-base",
        icon: "size-10",
        "icon-xs":
          "size-8 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

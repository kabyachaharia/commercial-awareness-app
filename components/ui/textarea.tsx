import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-24 w-full rounded-lg border-2 border-black bg-white px-3 py-2 text-base transition-colors outline-none placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-black/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }

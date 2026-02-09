import * as React from "react"
import { cn } from "@/lib/utils"

const BentoGrid = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6",
      className
    )}
    {...props}
  />
))
BentoGrid.displayName = "BentoGrid"

export { BentoGrid }

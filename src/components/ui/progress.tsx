import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & { indicatorClassName?: string }
>(({ className, value, indicatorClassName, ...props }, ref) => {
  // The `style` prop (e.g., from Dashboard.tsx) is within `...props`
  // and will be applied to ProgressPrimitive.Root.
  // This style may set CSS variables like --progress-indicator-color.
  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-secondary", // Default track background
        className // Custom classes for the track (e.g., height override)
      )}
      {...props} // Spreads props (including style) to the Root.
                  // `indicatorClassName` is NOT spread because it's destructured.
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 bg-primary transition-all", // Default indicator style
          indicatorClassName // Custom classes for the indicator
        )}
        style={{
          transform: `translateX(-${100 - (value || 0)}%)`,
          // Use the CSS variable for background color if it's set on the root.
          // This allows dynamic coloring from parent components.
          backgroundColor: props.style?.['--progress-indicator-color'] ? 'var(--progress-indicator-color)' : undefined
        }}
      />
    </ProgressPrimitive.Root>
  );
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }

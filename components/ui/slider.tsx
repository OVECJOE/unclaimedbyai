"use client"

import * as React from "react"
import { cn } from "cn"
import { Slider as SliderPrimitive } from "radix-ui"

/**
 * A square track that fills violet up to a square handle, matching the
 * Switch: no rounding, a hairline border, the same focus ring. Keyboard
 * and touch come from Radix (arrows, Home/End, Page Up/Down, drag).
 */
function Slider({
  className,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const count = (props.value ?? props.defaultValue ?? [0]).length

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      className={cn(
        "relative flex w-full touch-none items-center py-2.5 select-none data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="relative h-1.5 w-full grow overflow-hidden border border-input/60 bg-muted"
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="absolute h-full bg-primary"
        />
      </SliderPrimitive.Track>
      {Array.from({ length: count }, (_, index) => (
        <SliderPrimitive.Thumb
          key={index}
          data-slot="slider-thumb"
          className="block size-4.5 shrink-0 cursor-grab border border-primary bg-background transition-[box-shadow,transform] outline-none after:absolute after:-inset-2 hover:ring-4 hover:ring-primary/15 focus-visible:ring-4 focus-visible:ring-ring/30 active:scale-95 active:cursor-grabbing disabled:pointer-events-none motion-reduce:transition-none dark:bg-primary-foreground"
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }

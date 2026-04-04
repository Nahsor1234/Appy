"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { motion, useAnimation } from "framer-motion"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, onValueChange, ...props }, ref) => {
  const controls = useAnimation()

  const handleStop = () => {
    // Playful scale-based "pop" effect on release
    controls.start({
      scale: [1, 1.25, 0.95, 1.05, 1],
      transition: { duration: 0.45, ease: "easeOut" }
    })
  }

  return (
    <SliderPrimitive.Root
      ref={ref}
      onValueChange={onValueChange}
      onPointerUp={handleStop}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20">
        <SliderPrimitive.Range className="absolute h-full bg-primary" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb asChild>
        <motion.div 
          animate={controls}
          initial={{ scale: 1 }}
          className={cn(
            "block h-5 w-5 rounded-full border-[2.5px] border-primary bg-background shadow-[0_0_12px_hsl(var(--primary)/0.3)] ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-grab active:cursor-grabbing transition-colors",
          )} 
        />
      </SliderPrimitive.Thumb>
    </SliderPrimitive.Root>
  )
})
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }

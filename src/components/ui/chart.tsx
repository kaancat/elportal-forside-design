import * as React from "react"

import { cn } from "@/lib/utils"

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<string, string> }
  )
}

// Minimal stub components to maintain exports without recharts dependency

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config?: ChartConfig
    children?: React.ReactNode
  }
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex aspect-video justify-center text-xs", className)}
      {...props}
    >
      {children}
    </div>
  )
})
ChartContainer.displayName = "Chart"

const ChartTooltip = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return <div ref={ref} className={className} {...props} />
})
ChartTooltip.displayName = "ChartTooltip"

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return <div ref={ref} className={className} {...props} />
})
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return <div ref={ref} className={className} {...props} />
})
ChartLegend.displayName = "ChartLegend"

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return <div ref={ref} className={className} {...props} />
})
ChartLegendContent.displayName = "ChartLegendContent"

const ChartStyle = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return <div ref={ref} className={className} {...props} />
})
ChartStyle.displayName = "ChartStyle"

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
}

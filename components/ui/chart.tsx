"use client"

import React from "react"

import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { cn } from "@/lib/utils"
import * as RechartsPrimitive from "recharts"

// Workaround for https://github.com/recharts/recharts/issues/3615
// @ts-ignore
RechartsPrimitive.Tooltip.displayName = "Tooltip"

const Chart = React.forwardRef<
  React.ElementRef<typeof ChartContainer>,
  {
    config: ChartConfig
    children: React.ComponentProps<typeof ChartContainer>["children"]
  } & React.ComponentProps<typeof ChartContainer>
>(({ config, children, className, ...props }, ref) => {
  const id = React.useId()
  if (!config || typeof config !== "object") {
    return null
  }
  return (
    <ChartContainer
      id={id}
      ref={ref}
      className={cn(
        "[&_.recharts-tooltip-content>div]:grid [&_.recharts-tooltip-content>div]:gap-1 [&_.recharts-tooltip-content>div]:p-2 [&_.recharts-tooltip-content]:rounded-md [&_.recharts-tooltip-content]:border [&_.recharts-tooltip-content]:border-slate-200 [&_.recharts-tooltip-content]:bg-white [&_.recharts-tooltip-content]:px-2 [&_.recharts-tooltip-content]:py-1.5 [&_.recharts-tooltip-content]:text-slate-950 [&_.recharts-tooltip-content]:shadow-md dark:[&_.recharts-tooltip-content]:border-slate-800 dark:[&_.recharts-tooltip-content]:bg-slate-950 dark:[&_.recharts-tooltip-content]:text-slate-50",
        className,
      )}
      config={config}
      {...props}
    >
      {children}
    </ChartContainer>
  )
})
Chart.displayName = "Chart"

const ChartCrosshair = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.Crosshair>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Crosshair>
>(({ className, ...props }, ref) => (
  <RechartsPrimitive.Crosshair
    ref={ref}
    className={cn("stroke-slate-100 stroke-dasharray-3", "dark:stroke-slate-800", className)}
    {...props}
  />
))
ChartCrosshair.displayName = "ChartCrosshair"

const ChartLegend = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.Legend>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Legend>
>(({ className, content, ...props }, ref) => (
  <RechartsPrimitive.Legend
    ref={ref}
    content={content || <ChartLegendContent />}
    className={cn("!h-auto !w-full", className)}
    {...props}
  />
))
ChartLegend.displayName = "ChartLegend"

const ChartLegendContent = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & {
    payload?: RechartsPrimitive.PayloadProps[]
  }
>(({ className, payload, ...props }, ref) => {
  const { config } = React.useContext(ChartContext)

  if (!payload || !config) {
    return null
  }

  return (
    <div ref={ref} className={cn("flex flex-wrap items-center justify-center gap-4", className)} {...props}>
      {payload.map((item) => {
        if (item.type === "none") {
          return null
        }

        const { color } = config[item.value as keyof typeof config]

        return (
          <div key={item.value} className="flex items-center gap-1.5">
            <span className={cn("h-3 w-3 shrink-0 rounded-full", color && `bg-${color}`)} />
            {item.value}
          </div>
        )
      })}
    </div>
  )
})
ChartLegendContent.displayName = "ChartLegendContent"

const ChartActiveShape = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.ActiveShape>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.ActiveShape>
>(({ className, ...props }, ref) => (
  <RechartsPrimitive.ActiveShape
    ref={ref}
    className={cn("stroke-slate-950 stroke-2 fill-slate-950", "dark:stroke-slate-50 dark:fill-slate-50", className)}
    {...props}
  />
))
ChartActiveShape.displayName = "ChartActiveShape"

const ChartTooltip = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.Tooltip>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Tooltip>
>(({ className, content, ...props }, ref) => {
  const { config } = React.useContext(ChartContext)

  if (!content) {
    return null
  }

  return (
    <RechartsPrimitive.Tooltip
      ref={ref}
      content={<ChartTooltipContent config={config} />}
      className={cn("!bg-white dark:!bg-gray-950", className)}
      {...props}
    />
  )
})
ChartTooltip.displayName = "ChartTooltip"

const ChartContext = React.createContext<{ config: ChartConfig } & Record<string, any>>({
  config: {},
})

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer> & {
  id: string
  config: ChartConfig
}) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={id}
        ref={containerRef}
        className={cn("flex h-[350px] w-full flex-col items-center justify-center", className)}
        {...props}
      >
        {mounted ? (
          <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
        ) : (
          <div className="flex h-[350px] w-full items-center justify-center text-muted-foreground">Loading...</div>
        )}
      </div>
    </ChartContext.Provider>
  )
}

const ChartTooltipContent = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & {
    hideLabel?: boolean
    hideIndicator?: boolean
    is
    nameKey?: string
    valueKey?: string
    payload?: RechartsPrimitive.PayloadProps[]
    config: ChartConfig
  }
>(({ className, hideLabel = false, hideIndicator = false, is, nameKey, valueKey, payload, config, ...props }, ref) => {
  if (!payload || !payload.length) {
    return null
  }

  const data = payload[0].payload
  const _config = config

  return (
    <div ref={ref} className={cn("grid min-w-[8rem] items-start text-xs", className)} {...props}>
      {!hideLabel && data.name && <div className="block text-sm font-medium">{data.name}</div>}
      {payload.map((item) => {
        const key = nameKey || item.dataKey || item.name
        const val = valueKey || item.value

        if (!key || key === "name") {
          return null
        }

        const { color, label } = _config[key as keyof typeof _config]

        return (
          <div key={item.dataKey} className="flex items-center justify-between gap-4">
            {!hideIndicator && <span className={cn("h-2 w-2 shrink-0 rounded-full", color && `bg-${color}`)} />}
            <div className="flex flex-1 justify-between">
              {label ? label : key}:<span className="font-mono font-medium tabular-nums">{val?.toLocaleString()}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.Legend>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Legend>
>(({ className, content, ...props }, ref) => (
  <RechartsPrimitive.Legend
    ref={ref}
    content={content || <ChartLegendContent />}
    className={cn("!h-auto !w-full", className)}
    {...props}
  />
))
ChartLegend.displayName = "ChartLegend"

const ChartLegendContent = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & {
    payload?: RechartsPrimitive.PayloadProps[]
  }
>(({ className, payload, ...props }, ref) => {
  const { config } = React.useContext(ChartContext)

  if (!payload || !config) {
    return null
  }

  return (
    <div ref={ref} className={cn("flex flex-wrap items-center justify-center gap-4", className)} {...props}>
      {payload.map((item) => {
        if (item.type === "none") {
          return null
        }

        const { color } = config[item.value as keyof typeof config]

        return (
          <div key={item.value} className="flex items-center gap-1.5">
            <span className={cn("h-3 w-3 shrink-0 rounded-full", color && `bg-${color}`)} />
            {item.value}
          </div>
        )
      })}
    </div>
  )
})
ChartLegendContent.displayName = "ChartLegendContent"

const ChartActiveShape = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.ActiveShape>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.ActiveShape>
>(({ className, ...props }, ref) => (
  <RechartsPrimitive.ActiveShape
    ref={ref}
    className={cn("stroke-slate-950 stroke-2 fill-slate-950", "dark:stroke-slate-50 dark:fill-slate-50", className)}
    {...props}
  />
))
ChartActiveShape.displayName = "ChartActiveShape"

const ChartCrosshair = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.Crosshair>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Crosshair>
>(({ className, ...props }, ref) => (
  <RechartsPrimitive.Crosshair
    ref={ref}
    className={cn("stroke-slate-100 stroke-dasharray-3", "dark:stroke-slate-800", className)}
    {...props}
  />
))
ChartCrosshair.displayName = "ChartCrosshair"

const ChartTooltip = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.Tooltip>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Tooltip>
>(({ className, content, ...props }, ref) => {
  const { config } = React.useContext(ChartContext)

  if (!content) {
    return null
  }

  return (
    <RechartsPrimitive.Tooltip
      ref={ref}
      content={<ChartTooltipContent config={config} />}
      className={cn("!bg-white dark:!bg-gray-950", className)}
      {...props}
    />
  )
})
ChartTooltip.displayName = "ChartTooltip"

const ChartContext = React.createContext<{ config: ChartConfig } & Record<string, any>>({
  config: {},
})

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer> & {
  id: string
  config: ChartConfig
}) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={id}
        ref={containerRef}
        className={cn("flex h-[350px] w-full flex-col items-center justify-center", className)}
        {...props}
      >
        {mounted ? (
          <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
        ) : (
          <div className="flex h-[350px] w-full items-center justify-center text-muted-foreground">Loading...</div>
        )}
      </div>
    </ChartContext.Provider>
  )
}

const ChartTooltipContent = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & {
    hideLabel?: boolean
    hideIndicator?: boolean
    is
    nameKey?: string
    valueKey?: string
    payload?: RechartsPrimitive.PayloadProps[]
    config: ChartConfig
  }
>(({ className, hideLabel = false, hideIndicator = false, is, nameKey, valueKey, payload, config, ...props }, ref) => {
  if (!payload || !payload.length) {
    return null
  }

  const data = payload[0].payload
  const _config = config

  return (
    <div ref={ref} className={cn("grid min-w-[8rem] items-start text-xs", className)} {...props}>
      {!hideLabel && data.name && <div className="block text-sm font-medium">{data.name}</div>}
      {payload.map((item) => {
        const key = nameKey || item.dataKey || item.name
        const val = valueKey || item.value

        if (!key || key === "name") {
          return null
        }

        const { color, label } = _config[key as keyof typeof _config]

        return (
          <div key={item.dataKey} className="flex items-center justify-between gap-4">
            {!hideIndicator && <span className={cn("h-2 w-2 shrink-0 rounded-full", color && `bg-${color}`)} />}
            <div className="flex flex-1 justify-between">
              {label ? label : key}:<span className="font-mono font-medium tabular-nums">{val?.toLocaleString()}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.Legend>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Legend>
>(({ className, content, ...props }, ref) => (
  <RechartsPrimitive.Legend
    ref={ref}
    content={content || <ChartLegendContent />}
    className={cn("!h-auto !w-full", className)}
    {...props}
  />
))
ChartLegend.displayName = "ChartLegend"

const ChartLegendContent = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & {
    payload?: RechartsPrimitive.PayloadProps[]
  }
>(({ className, payload, ...props }, ref) => {
  const { config } = React.useContext(ChartContext)

  if (!payload || !config) {
    return null
  }

  return (
    <div ref={ref} className={cn("flex flex-wrap items-center justify-center gap-4", className)} {...props}>
      {payload.map((item) => {
        if (item.type === "none") {
          return null
        }

        const { color } = config[item.value as keyof typeof config]

        return (
          <div key={item.value} className="flex items-center gap-1.5">
            <span className={cn("h-3 w-3 shrink-0 rounded-full", color && `bg-${color}`)} />
            {item.value}
          </div>
        )
      })}
    </div>
  )
})
ChartLegendContent.displayName = "ChartLegendContent"

const ChartActiveShape = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.ActiveShape>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.ActiveShape>
>(({ className, ...props }, ref) => (
  <RechartsPrimitive.ActiveShape
    ref={ref}
    className={cn("stroke-slate-950 stroke-2 fill-slate-950", "dark:stroke-slate-50 dark:fill-slate-50", className)}
    {...props}
  />
))
ChartActiveShape.displayName = "ChartActiveShape"

const ChartCrosshair = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.Crosshair>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Crosshair>
>(({ className, ...props }, ref) => (
  <RechartsPrimitive.Crosshair
    ref={ref}
    className={cn("stroke-slate-100 stroke-dasharray-3", "dark:stroke-slate-800", className)}
    {...props}
  />
))
ChartCrosshair.displayName = "ChartCrosshair"

const ChartTooltip = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.Tooltip>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Tooltip>
>(({ className, content, ...props }, ref) => (
  <RechartsPrimitive.Tooltip
    ref={ref}
    content={content || <ChartTooltipContent config={config} />}
    className={cn("!bg-white dark:!bg-gray-950", className)}
    {...props}
  />
))
ChartTooltip.displayName = "ChartTooltip"

const ChartContext = React.createContext<{ config: ChartConfig } & Record<string, any>>({
  config: {},
})

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer> & {
  id: string
  config: ChartConfig
}) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={id}
        ref={containerRef}
        className={cn("flex h-[350px] w-full flex-col items-center justify-center", className)}
        {...props}
      >
        {mounted ? (
          <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
        ) : (
          <div className="flex h-[350px] w-full items-center justify-center text-muted-foreground">Loading...</div>
        )}
      </div>
    </ChartContext.Provider>
  )
}

const ChartTooltipContent = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & {
    hideLabel?: boolean
    hideIndicator?: boolean
    is
    nameKey?: string
    valueKey?: string
    payload?: RechartsPrimitive.PayloadProps[]
    config: ChartConfig
  }
>(({ className, hideLabel = false, hideIndicator = false, is, nameKey, valueKey, payload, config, ...props }, ref) => {
  if (!payload || !payload.length) {
    return null
  }

  const data = payload[0].payload
  const _config = config

  return (
    <div ref={ref} className={cn("grid min-w-[8rem] items-start text-xs", className)} {...props}>
      {!hideLabel && data.name && <div className="block text-sm font-medium">{data.name}</div>}
      {payload.map((item) => {
        const key = nameKey || item.dataKey || item.name
        const val = valueKey || item.value

        if (!key || key === "name") {
          return null
        }

        const { color, label } = _config[key as keyof typeof _config]

        return (
          <div key={item.dataKey} className="flex items-center justify-between gap-4">
            {!hideIndicator && <span className={cn("h-2 w-2 shrink-0 rounded-full", color && `bg-${color}`)} />}
            <div className="flex flex-1 justify-between">
              {label ? label : key}:<span className="font-mono font-medium tabular-nums">{val?.toLocaleString()}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.Legend>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Legend>
>(({ className, content, ...props }, ref) => (
  <RechartsPrimitive.Legend
    ref={ref}
    content={content || <ChartLegendContent />}
    className={cn("!h-auto !w-full", className)}
    {...props}
  />
))
ChartLegend.displayName = "ChartLegend"

const ChartLegendContent = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & {
    payload?: RechartsPrimitive.PayloadProps[]
  }
>(({ className, payload, ...props }, ref) => {
  const { config } = React.useContext(ChartContext)

  if (!payload || !config) {
    return null
  }

  return (
    <div ref={ref} className={cn("flex flex-wrap items-center justify-center gap-4", className)} {...props}>
      {payload.map((item) => {
        if (item.type === "none") {
          return null
        }

        const { color } = config[item.value as keyof typeof config]

        return (
          <div key={item.value} className="flex items-center gap-1.5">
            <span className={cn("h-3 w-3 shrink-0 rounded-full", color && `bg-${color}`)} />
            {item.value}
          </div>
        )
      })}
    </div>
  )
})
ChartLegendContent.displayName = "ChartLegendContent"

const ChartActiveShape = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.ActiveShape>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.ActiveShape>
>(({ className, ...props }, ref) => (
  <RechartsPrimitive.ActiveShape
    ref={ref}
    className={cn("stroke-slate-950 stroke-2 fill-slate-950", "dark:stroke-slate-50 dark:fill-slate-50", className)}
    {...props}
  />
))
ChartActiveShape.displayName = "ChartActiveShape"

const ChartCrosshair = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.Crosshair>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Crosshair>
>(({ className, ...props }, ref) => (
  <RechartsPrimitive.Crosshair
    ref={ref}
    className={cn("stroke-slate-100 stroke-dasharray-3", "dark:stroke-slate-800", className)}
    {...props}
  />
))
ChartCrosshair.displayName = "ChartCrosshair"

const ChartTooltip = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.Tooltip>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Tooltip>
>(({ className, content, ...props }, ref) => (
  <RechartsPrimitive.Tooltip
    ref={ref}
    content={content || <ChartTooltipContent config={config} />}
    className={cn("!bg-white dark:!bg-gray-950", className)}
    {...props}
  />
))
ChartTooltip.displayName = "ChartTooltip"

const ChartContext = React.createContext<{ config: ChartConfig } & Record<string, any>>({
  config: {},
})

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer> & {
  id: string
  config: ChartConfig
}) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={id}
        ref={containerRef}
        className={cn("flex h-[350px] w-full flex-col items-center justify-center", className)}
        {...props}
      >
        {mounted ? (
          <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
        ) : (
          <div className="flex h-[350px] w-full items-center justify-center text-muted-foreground">Loading...</div>
        )}
      </div>
    </ChartContext.Provider>
  )
}

const ChartTooltipContent = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & {
    hideLabel?: boolean
    hideIndicator?: boolean
    is
    nameKey?: string
    valueKey?: string
    payload?: RechartsPrimitive.PayloadProps[]
    config: ChartConfig
  }
>(({ className, hideLabel = false, hideIndicator = false, is, nameKey, valueKey, payload, config, ...props }, ref) => {
  if (!payload || !payload.length) {
    return null
  }

  const data = payload[0].payload
  const _config = config

  return (
    <div ref={ref} className={cn("grid min-w-[8rem] items-start text-xs", className)} {...props}>
      {!hideLabel && data.name && <div className="block text-sm font-medium">{data.name}</div>}
      {payload.map((item) => {
        const key = nameKey || item.dataKey || item.name
        const val = valueKey || item.value

        if (!key || key === "name") {
          return null
        }

        const { color, label } = _config[key as keyof typeof _config]

        return (
          <div key={item.dataKey} className="flex items-center justify-between gap-4">
            {!hideIndicator && <span className={cn("h-2 w-2 shrink-0 rounded-full", color && `bg-${color}`)} />}
            <div className="flex flex-1 justify-between">
              {label ? label : key}:<span className="font-mono font-medium tabular-nums">{val?.toLocaleString()}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.Legend>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Legend>
>(({ className, content, ...props }, ref) => (
  <RechartsPrimitive.Legend
    ref={ref}
    content={content || <ChartLegendContent />}
    className={cn("!h-auto !w-full", className)}
    {...props}
  />
))
ChartLegend.displayName = "ChartLegend"

const ChartLegendContent = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & {
    payload?: RechartsPrimitive.PayloadProps[]
  }
>(({ className, payload, ...props }, ref) => {
  const { config } = React.useContext(ChartContext)

  if (!payload || !config) {
    return null
  }

  return (
    <div ref={ref} className={cn("flex flex-wrap items-center justify-center gap-4", className)} {...props}>
      {payload.map((item) => {
        if (item.type === "none") {
          return null
        }

        const { color } = config[item.value as keyof typeof config]

        return (
          <div key={item.value} className="flex items-center gap-1.5">
            <span className={cn("h-3 w-3 shrink-0 rounded-full", color && `bg-${color}`)} />
            {item.value}
          </div>
        )
      })}
    </div>
  )
})
ChartLegendContent.displayName = "ChartLegendContent"

const ChartActiveShape = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.ActiveShape>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.ActiveShape>
>(({ className, ...props }, ref) => (
  <RechartsPrimitive.ActiveShape
    ref={ref}
    className={cn("stroke-slate-950 stroke-2 fill-slate-950", "dark:stroke-slate-50 dark:fill-slate-50", className)}
    {...props}
  />
))
ChartActiveShape.displayName = "ChartActiveShape"

const ChartCrosshair = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.Crosshair>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Crosshair>
>(({ className, ...props }, ref) => (
  <RechartsPrimitive.Crosshair
    ref={ref}
    className={cn("stroke-slate-100 stroke-dasharray-3", "dark:stroke-slate-800", className)}
    {...props}
  />
))
ChartCrosshair.displayName = "ChartCrosshair"

const ChartTooltip = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.Tooltip>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Tooltip>
>(({ className, content, ...props }, ref) => (
  <RechartsPrimitive.Tooltip
    ref={ref}
    content={content || <ChartTooltipContent config={config} />}
    className={cn("!bg-white dark:!bg-gray-950", className)}
    {...props}
  />
))
ChartTooltip.displayName = "ChartTooltip"

const ChartContext = React.createContext<{ config: ChartConfig } & Record<string, any>>({
  config: {},
})

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer> & {
  id: string
  config: ChartConfig
}) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={id}
        ref={containerRef}
        className={cn("flex h-[350px] w-full flex-col items-center justify-center", className)}
        {...props}
      >
        {mounted ? (
          <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
        ) : (
          <div className="flex h-[350px] w-full items-center justify-center text-muted-foreground">Loading...</div>
        )}
      </div>
    </ChartContext.Provider>
  )
}

const ChartTooltipContent = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & {
    hideLabel?: boolean
    hideIndicator?: boolean
    is
    nameKey?: string
    valueKey?: string
    payload?: RechartsPrimitive.PayloadProps[]
    config: ChartConfig
  }
>(({ className, hideLabel = false, hideIndicator = false, is, nameKey, valueKey, payload, config, ...props }, ref) => {
  if (!payload || !payload.length) {
    return null
  }

  const data = payload[0].payload
  const _config = config

  return (
    <div ref={ref} className={cn("grid min-w-[8rem] items-start text-xs", className)} {...props}>
      {!hideLabel && data.name && <div className="block text-sm font-medium">{data.name}</div>}
      {payload.map((item) => {
        const key = nameKey || item.dataKey || item.name
        const val = valueKey || item.value

        if (!key || key === "name") {
          return null
        }

        const { color, label } = _config[key as keyof typeof _config]

        return (
          <div key={item.dataKey} className="flex items-center justify-between gap-4">
            {!hideIndicator && <span className={cn("h-2 w-2 shrink-0 rounded-full", color && `bg-${color}`)} />}
            <div className="flex flex-1 justify-between">
              {label ? label : key}:<span className="font-mono font-medium tabular-nums">{val?.toLocaleString()}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.Legend>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Legend>
>(({ className, content, ...props }, ref) => (
  <RechartsPrimitive.Legend
    ref={ref}
    content={content || <ChartLegendContent />}
    className={cn("!h-auto !w-full", className)}
    {...props}
  />
))
ChartLegend.displayName = "ChartLegend"

const ChartLegendContent = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & {
    payload?: RechartsPrimitive.PayloadProps[]
  }
>(({ className, payload, ...props }, ref) => {
  const { config } = React.useContext(ChartContext)

  if (!payload || !config) {
    return null
  }

  return (
    <div ref={ref} className={cn("flex flex-wrap items-center justify-center gap-4", className)} {...props}>
      {payload.map((item) => {
        if (item.type === "none") {
          return null
        }

        const { color } = config[item.value as keyof typeof config]

        return (
          <div key={item.value} className="flex items-center gap-1.5">
            <span className={cn("h-3 w-3 shrink-0 rounded-full", color && `bg-${color}`)} />
            {item.value}
          </div>
        )
      })}
    </div>
  )
})
ChartLegendContent.displayName = "ChartLegendContent"

const ChartActiveShape = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.ActiveShape>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.ActiveShape>
>(({ className, ...props }, ref) => (
  <RechartsPrimitive.ActiveShape
    ref={ref}
    className={cn("stroke-slate-950 stroke-2 fill-slate-950", "dark:stroke-slate-50 dark:fill-slate-50", className)}
    {...props}
  />
))
ChartActiveShape.displayName = "ChartActiveShape"

const ChartCrosshair = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.Crosshair>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Crosshair>
>(({ className, ...props }, ref) => (
  <RechartsPrimitive.Crosshair
    ref={ref}
    className={cn("stroke-slate-100 stroke-dasharray-3", "dark:stroke-slate-800", className)}
    {...props}
  />
))
ChartCrosshair.displayName = "ChartCrosshair"

const ChartTooltip = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.Tooltip>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Tooltip>
>(({ className, content, ...props }, ref) => (
  <RechartsPrimitive.Tooltip
    ref={ref}
    content={content || <ChartTooltipContent config={config} />}
    className={cn("!bg-white dark:!bg-gray-950", className)}
    {...props}
  />
))
ChartTooltip.displayName = "ChartTooltip"

const ChartContext = React.createContext<{ config: ChartConfig } & Record<string, any>>({
  config: {},
})

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer> & {
  id: string
  config: ChartConfig
}) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={id}
        ref={containerRef}
        className={cn("flex h-[350px] w-full flex-col items-center justify-center", className)}
        {...props}
      >
        {mounted ? (
          <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
        ) : (
          <div className="flex h-[350px] w-full items-center justify-center text-muted-foreground">Loading...</div>
        )}
      </div>
    </ChartContext.Provider>
  )
}

const ChartTooltipContent = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & {
    hideLabel?: boolean
    hideIndicator?: boolean
    is
    nameKey?: string
    valueKey?: string
    payload?: RechartsPrimitive.PayloadProps[]
    config: ChartConfig
  }
>(({ className, hideLabel = false, hideIndicator = false, is, nameKey, valueKey, payload, config, ...props }, ref) => {
  if (!payload || !payload.length) {
    return null
  }

  const data = payload[0].payload
  const _config = config

  return (
    <div ref={ref} className={cn("grid min-w-[8rem] items-start text-xs", className)} {...props}>
      {!hideLabel && data.name && <div className="block text-sm font-medium">{data.name}</div>}
      {payload.map((item) => {
        const key = nameKey || item.dataKey || item.name
        const val = valueKey || item.value

        if (!key || key === "name") {
          return null
        }

        const { color, label } = _config[key as keyof typeof _config]

        return (
          <div key={item.dataKey} className="flex items-center justify-between gap-4">
            {!hideIndicator && <span className={cn("h-2 w-2 shrink-0 rounded-full", color && `bg-${color}`)} />}
            <div className="flex flex-1 justify-between">
              {label ? label : key}:<span className="font-mono font-medium tabular-nums">{val?.toLocaleString()}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.Legend>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Legend>
>(({ className, content, ...props }, ref) => (
  <RechartsPrimitive.Legend
    ref={ref}
    content={content || <ChartLegendContent />}
    className={cn("!h-auto !w-full", className)}
    {...props}
  />
))
ChartLegend.displayName = "ChartLegend"

const ChartLegendContent = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & {
    payload?: RechartsPrimitive.PayloadProps[]
  }
>(({ className, payload, ...props }, ref) => {
  const { config } = React.useContext(ChartContext)

  if (!payload || !config) {
    return null
  }

  return (
    <div ref={ref} className={cn("flex flex-wrap items-center justify-center gap-4", className)} {...props}>
      {payload.map((item) => {
        if (item.type === "none") {
          return null
        }

        const { color } = config[item.value as keyof typeof config]

        return (
          <div key={item.value} className="flex items-center gap-1.5">
            <span className={cn("h-3 w-3 shrink-0 rounded-full", color && `bg-${color}`)} />
            {item.value}
          </div>
        )
      })}
    </div>
  )
})
ChartLegendContent.displayName = "ChartLegendContent"

const ChartActiveShape = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.ActiveShape>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.ActiveShape>
>(({ className, ...props }, ref) => (
  <RechartsPrimitive.ActiveShape
    ref={ref}
    className={cn("stroke-slate-950 stroke-2 fill-slate-950", "dark:stroke-slate-50 dark:fill-slate-50", className)}
    {...props}
  />
))
ChartActiveShape.displayName = "ChartActiveShape"

const ChartCrosshair = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.Crosshair>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Crosshair>
>(({ className, ...props }, ref) => (
  <RechartsPrimitive.Crosshair
    ref={ref}
    className={cn("stroke-slate-100 stroke-dasharray-3", "dark:stroke-slate-800", className)}
    {...props}
  />
))
ChartCrosshair.displayName = "ChartCrosshair"

const ChartTooltip = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.Tooltip>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Tooltip>
>(({ className, content, ...props }, ref) => (
  <RechartsPrimitive.Tooltip
    ref={ref}
    content={content || <ChartTooltipContent config={config} />}
    className={cn("!bg-white dark:!bg-gray-950", className)}
    {...props}
  />
))
ChartTooltip.displayName = "ChartTooltip"

const ChartContext = React.createContext<{ config: ChartConfig } & Record<string, any>>({
  config: {},
})

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer> & {
  id: string
  config: ChartConfig
}) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={id}
        ref={containerRef}
        className={cn("flex h-[350px] w-full flex-col items-center justify-center", className)}
        {...props}
      >
        {mounted ? (
          <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
        ) : (
          <div className="flex h-[350px] w-full items-center justify-center text-muted-foreground">Loading...</div>
        )}
      </div>
    </ChartContext.Provider>
  )
}

const ChartTooltipContent = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & {
    hideLabel?: boolean
    hideIndicator?: boolean
    is
    nameKey?: string
    valueKey?: string
    payload?: RechartsPrimitive.PayloadProps[]
    config: ChartConfig
  }
>(({ className, hideLabel = false, hideIndicator = false, is, nameKey, valueKey, payload, config, ...props }, ref) => {
  if (!payload || !payload.length) {
    return null
  }

  const data = payload[0].payload
  const _config = config

  return (
    <div ref={ref} className={cn("grid min-w-[8rem] items-start text-xs", className)} {...props}>
      {!hideLabel && data.name && <div className="block text-sm font-medium">{data.name}</div>}
      {payload.map((item) => {
        const key = nameKey || item.dataKey || item.name
        const val = valueKey || item.value

        if (!key || key === "name") {
          return null
        }

        const { color, label } = _config[key as keyof typeof _config]

        return (
          <div key={item.dataKey} className="flex items-center justify-between gap-4">
            {!hideIndicator && <span className={cn("h-2 w-2 shrink-0 rounded-full", color && `bg-${color}`)} />}
            <div className="flex flex-1 justify-between">
              {label ? label : key}:<span className="font-mono font-medium tabular-nums">{val?.toLocaleString()}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.Legend>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Legend>
>(({ className, content, ...props }, ref) => (
  <RechartsPrimitive.Legend
    ref={ref}
    content={content || <ChartLegendContent />}
    className={cn("!h-auto !w-full", className)}
    {...props}
  />
))
ChartLegend.displayName = "ChartLegend"

const ChartLegendContent = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & {
    payload?: RechartsPrimitive.PayloadProps[]
  }
>(({ className, payload, ...props }, ref) => {
  const { config } = React.useContext(ChartContext)

  if (!payload || !config) {
    return null
  }

  return (
    <div ref={ref} className={cn("flex flex-wrap items-center justify-center gap-4", className)} {...props}>
      {payload.map((item) => {
        if (item.type === "none") {
          return null
        }

        const { color } = config[item.value as keyof typeof config]

        return (
          <div key={item.value} className="flex items-center gap-1.5">
            <span className={cn("h-3 w-3 shrink-0 rounded-full", color && `bg-${color}`)} />
            {item.value}
          </div>
        )
      })}
    </div>
  )
})
ChartLegendContent.displayName = "ChartLegendContent"

const ChartActiveShape = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.ActiveShape>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.ActiveShape>
>(({ className, ...props }, ref) => (
  <RechartsPrimitive.ActiveShape
    ref={ref}
    className={cn("stroke-slate-950 stroke-2 fill-slate-950", "dark:stroke-slate-50 dark:fill-slate-50", className)}
    {...props}
  />
))
ChartActiveShape.displayName = "ChartActiveShape"

const ChartCrosshair = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.Crosshair>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Crosshair>
>(({ className, ...props }, ref) => (
  <RechartsPrimitive.Crosshair
    ref={ref}
    className={cn("stroke-slate-100 stroke-dasharray-3", "dark:stroke-slate-800", className)}
    {...props}
  />
))
ChartCrosshair.displayName = "ChartCrosshair"

const ChartTooltip = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.Tooltip>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Tooltip>
>(({ className, content, ...props }, ref) => (
  <RechartsPrimitive.Tooltip
    ref={ref}
    content={content || <ChartTooltipContent config={config} />}
    className={cn("!bg-white dark:!bg-gray-950", className)}
    {...props}
  />
))
ChartTooltip.displayName = "ChartTooltip"

const ChartContext = React.createContext<{ config: ChartConfig } & Record<string, any>>({
  config: {},
})

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer> & {
  id: string
  config: ChartConfig
}) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={id}
        ref={containerRef}
        className={cn("flex h-[350px] w-full flex-col items-center justify-center", className)}
        {...props}
      >
        {mounted ? (
          <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
        ) : (
          <div className="flex h-[350px] w-full items-center justify-center text-muted-foreground">Loading...</div>
        )}
      </div>
    </ChartContext.Provider>
  )
}

const ChartTooltipContent = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & {
    hideLabel?: boolean
    hideIndicator?: boolean
    is
    nameKey?: string
    valueKey?: string
    payload?: RechartsPrimitive.PayloadProps[]
    config: ChartConfig
  }
>(({ className, hideLabel = false, hideIndicator = false, is, nameKey, valueKey, payload, config, ...props }, ref) => {
  if (!payload || !payload.length) {
    return null
  }

  const data = payload[0].payload
  const _config = config

  return (
    <div ref={ref} className={cn("grid min-w-[8rem] items-start text-xs", className)} {...props}>
      {!hideLabel && data.name && <div className="block text-sm font-medium">{data.name}</div>}
      {payload.map((item) => {
        const key = nameKey || item.dataKey || item.name
        const val = valueKey || item.value

        if (!key || key === "name") {
          return null
        }

        const { color, label } = _config[key as keyof typeof _config]

        return (
          <div key={item.dataKey} className="flex items-center justify-between gap-4">
            {!hideIndicator && <span className={cn("h-2 w-2 shrink-0 rounded-full", color && `bg-${color}`)} />}
            <div className="flex flex-1 justify-between">
              {label ? label : key}:<span className="font-mono font-medium tabular-nums">{val?.toLocaleString()}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.Legend>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Legend>
>(({ className, content, ...props }, ref) => (
  <RechartsPrimitive.Legend
    ref={ref}
    content={content || <ChartLegendContent />}
    className={cn("!h-auto !w-full", className)}
    {...props}
  />
))
ChartLegend.displayName = "ChartLegend"

const ChartLegendContent = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & {
    payload?: RechartsPrimitive.PayloadProps[]
  }
>(({ className, payload, ...props }, ref) => {
  const { config } = React.useContext(ChartContext)

  if (!payload || !config) {
    return null
  }

  return (
    <div ref={ref} className={cn("flex flex-wrap items-center justify-center gap-4", className)} {...props}>
      {payload.map((item) => {
        if (item.type === "none") {
          return null
        }

        const { color } = config[item.value as keyof typeof config]

        return (
          <div key={item.value} className="flex items-center gap-1.5">
            <span className={cn("h-3 w-3 shrink-0 rounded-full", color && `bg-${color}`)} />
            {item.value}
          </div>
        )
      })}
    </div>
  )
})
ChartLegendContent.displayName = "ChartLegendContent"

const ChartActiveShape = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.ActiveShape>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.ActiveShape>
>(({ className, ...props }, ref) => (
  <RechartsPrimitive.ActiveShape
    ref={ref}
    className={cn("stroke-slate-950 stroke-2 fill-slate-950", "dark:stroke-slate-50 dark:fill-slate-50", className)}
    {...props}
  />
))
ChartActiveShape.displayName = "ChartActiveShape"

const ChartCrosshair = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.Crosshair>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Crosshair>
>(({ className, ...props }, ref) => (
  <RechartsPrimitive.Crosshair
    ref={ref}
    className={cn("stroke-slate-100 stroke-dasharray-3", "dark:stroke-slate-800", className)}
    {...props}
  />
))
ChartCrosshair.displayName = "ChartCrosshair"

const ChartTooltip = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.Tooltip>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Tooltip>
>(({ className, content, ...props }, ref) => (
  <RechartsPrimitive.Tooltip
    ref={ref}
    content={content || <ChartTooltipContent config={config} />}
    className={cn("!bg-white dark:!bg-gray-950", className)}
    {...props}
  />
))
ChartTooltip.displayName = "ChartTooltip"

const ChartContext = React.createContext<{ config: ChartConfig } & Record<string, any>>({
  config: {},
})

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer> & {
  id: string
  config: ChartConfig
}) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={id}
        ref={containerRef}
        className={cn("flex h-[350px] w-full flex-col items-center justify-center", className)}
        {...props}
      >
        {mounted ? (
          <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
        ) : (
          <div className="flex h-[350px] w-full items-center justify-center text-muted-foreground">Loading...</div>
        )}
      </div>
    </ChartContext.Provider>
  )
}

const ChartTooltipContent = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & {
    hideLabel?: boolean
    hideIndicator?: boolean
    is
    nameKey?: string
    valueKey?: string
    payload?: RechartsPrimitive.PayloadProps[]
    config: ChartConfig
  }
>(({ className, hideLabel = false, hideIndicator = false, is, nameKey, valueKey, payload, config, ...props }, ref) => {
  if (!payload || !payload.length) {
    return null
  }

  const data = payload[0].payload
  const _config = config

  return (
    <div ref={ref} className={cn("grid min-w-[8rem] items-start text-xs", className)} {...props}>
      {!hideLabel && data.name && <div className="block text-sm font-medium">{data.name}</div>}
      {payload.map((item) => {
        const key = nameKey || item.dataKey || item.name
        const val = valueKey || item.value

        if (!key || key === "name") {
          return null
        }

        const { color, label } = _config[key as keyof typeof _config]

        return (
          <div key={item.dataKey} className="flex items-center justify-between gap-4">
            {!hideIndicator && <span className={cn("h-2 w-2 shrink-0 rounded-full", color && `bg-${color}`)} />}
            <div className="flex flex-1 justify-between">
              {label ? label : key}:<span className="font-mono font-medium tabular-nums">{val?.toLocaleString()}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.Legend>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Legend>
>(({ className, content, ...props }, ref) => (
  <RechartsPrimitive.Legend
    ref={ref}
    content={content || <ChartLegendContent />}
    className={cn("!h-auto !w-full", className)}
    {...props}
  />
))
ChartLegend.displayName = "ChartLegend"

const ChartLegendContent = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & {
    payload?: RechartsPrimitive.PayloadProps[]
  }
>(({ className, payload, ...props }, ref) => {
  const { config } = React.useContext(ChartContext)

  if (!payload || !config) {
    return null
  }

  return (
    <div ref={ref} className={cn("flex flex-wrap items-center justify-center gap-4", className)} {...props}>
      {payload.map((item) => {
        if (item.type === "none") {
          return null
        }

        const { color } = config[item.value as keyof typeof config]

        return (
          <div key={item.value} className="flex items-center gap-1.5">
            <span className={cn("h-3 w-3 shrink-0 rounded-full", color && `bg-${color}`)} />
            {item.value}
          </div>
        )
      })}
    </div>
  )
})
ChartLegendContent.displayName = "ChartLegendContent"

const ChartActiveShape = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.ActiveShape>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.ActiveShape>
>(({ className, ...props }, ref) => (
  <RechartsPrimitive.ActiveShape
    ref={ref}
    className={cn("stroke-slate-950 stroke-2 fill-slate-950", "dark:stroke-slate-50 dark:fill-slate-50", className)}
    {...props}
  />
))
ChartActiveShape.displayName = "ChartActiveShape"

const ChartCrosshair = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.Crosshair>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Crosshair>
>(({ className, ...props }, ref) => (
  <RechartsPrimitive.Crosshair
    ref={ref}
    className={cn("stroke-slate-100 stroke-dasharray-3", "dark:stroke-slate-800", className)}
    {...props}
  />
))
ChartCrosshair.displayName = "ChartCrosshair"

const ChartTooltip = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.Tooltip>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Tooltip>
>(({ className, content, ...props }, ref) => (
  <RechartsPrimitive.Tooltip
    ref={ref}
    content={content || <ChartTooltipContent config={config} />}
    className={cn("!bg-white dark:!bg-gray-950", className)}
    {...props}
  />
))
ChartTooltip.displayName = "ChartTooltip"

const ChartContext = React.createContext<{ config: ChartConfig } & Record<string, any>>({
  config: {},
})

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer> & {
  id: string
  config: ChartConfig
}) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={id}
        ref={containerRef}
        className={cn("flex h-[350px] w-full flex-col items-center justify-center", className)}
        {...props}
      >
        {mounted ? (
          <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
        ) : (
          <div className="flex h-[350px] w-full items-center justify-center text-muted-foreground">Loading...</div>
        )}
      </div>
    </ChartContext.Provider>
  )
}

const ChartTooltipContent = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & {
    hideLabel?: boolean
    hideIndicator?: boolean
    is
    nameKey?: string
    valueKey?: string
    payload?: RechartsPrimitive.PayloadProps[]
    config: ChartConfig
  }
>(({ className, hideLabel = false, hideIndicator = false, is, nameKey, valueKey, payload, config, ...props }, ref) => {
  if (!payload || !payload.length) {
    return null
  }

  const data = payload[0].payload
  const _config = config

  return (
    <div ref={ref} className={cn("grid min-w-[8rem] items-start text-xs", className)} {...props}>
      {!hideLabel && data.name && <div className="block text-sm font-medium">{data.name}</div>}
      {payload.map((item) => {
        const key = nameKey || item.dataKey || item.name
        const val = valueKey || item.value

        if (!key || key === "name") {
          return null
        }

        const { color, label } = _config[key as keyof typeof _config]

        return (
          <div key={item.dataKey} className="flex items-center justify-between gap-4">
            {!hideIndicator && <span className={cn("h-2 w-2 shrink-0 rounded-full", color && `bg-${color}`)} />}
            <div className="flex flex-1 justify-between">
              {label ? label : key}:<span className="font-mono font-medium tabular-nums">{val?.toLocaleString()}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.Legend>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Legend>
>(({ className, content, ...props }, ref) => (
  <RechartsPrimitive.Legend
    ref={ref}
    content={content || <ChartLegendContent />}
    className={cn("!h-auto !w-full", className)}
    {...props}
  />
))
ChartLegend.displayName = "ChartLegend"

const ChartLegendContent = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & {
    payload?: RechartsPrimitive.PayloadProps[]
  }
>(({ className, payload, ...props }, ref) => {
  const { config } = React.useContext(ChartContext)

  if (!payload || !config) {
    return null
  }

  return (
    <div ref={ref} className={cn("flex flex-wrap items-center justify-center gap-4", className)} {...props}>
      {payload.map((item) => {
        if (item.type === "none") {
          return null
        }

        const { color } = config[item.value as keyof typeof config]

        return (
          <div key={item.value} className="flex items-center gap-1.5">
            <span className={cn("h-3 w-3 shrink-0 rounded-full", color && `bg-${color}`)} />
            {item.value}
          </div>
        )
      })}
    </div>
  )
})
ChartLegendContent.displayName = "ChartLegendContent"

const ChartActiveShape = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.ActiveShape>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.ActiveShape>
>(({ className, ...props }, ref) => (
  <RechartsPrimitive.ActiveShape
    ref={ref}
    className={cn("stroke-slate-950 stroke-2 fill-slate-950", "dark:stroke-slate-50 dark:fill-slate-50", className)}
    {...props}
  />
))
ChartActiveShape.displayName = "ChartActiveShape"

const ChartCrosshair = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.Crosshair>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Crosshair>
>(({ className, ...props }, ref) => (
  <RechartsPrimitive.Crosshair
    ref={ref}
    className={cn("stroke-slate-100 stroke-dasharray-3", "dark:stroke-slate-800", className)}
    {...props}
  />
))
ChartCrosshair.displayName = "ChartCrosshair"

const ChartTooltip = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.Tooltip>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Tooltip>
>(({ className, content, ...props }, ref) => (
  <RechartsPrimitive.Tooltip
    ref={ref}
    content={content || <ChartTooltipContent config={config} />}
    className={cn("!bg-white dark:!bg-gray-950", className)}
    {...props}
  />
))
ChartTooltip.displayName = "ChartTooltip"

const ChartContext = React.createContext<{ config: ChartConfig } & Record<string, any>>({
  config: {},
})

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer> & {
  id: string
  config: ChartConfig
}) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={id}
        ref={containerRef}
        className={cn("flex h-[350px] w-full flex-col items-center justify-center", className)}
        {...props}
      >
        {mounted ? (
          <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
        ) : (
          <div className="flex h-[350px] w-full items-center justify-center text-muted-foreground">Loading...</div>
        )}
      </div>
    </ChartContext.Provider>
  )
}

const ChartTooltipContent = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & {
    hideLabel?: boolean
    hideIndicator?: boolean
    is
    nameKey?: string
    valueKey?: string
    payload?: RechartsPrimitive.PayloadProps[]
    config: ChartConfig
  }
>(({ className, hideLabel = false, hideIndicator = false, is, nameKey, valueKey, payload, config, ...props }, ref) => {
  if (!payload || !payload.length) {
    return null
  }

  const data = payload[0].payload
  const _config = config

  return (
    <div ref={ref} className={cn("grid min-w-[8rem] items-start text-xs", className)} {...props}>
      {!hideLabel && data.name && <div className="block text-sm font-medium">{data.name}</div>}
      {payload.map((item) => {
        const key = nameKey || item.dataKey || item.name
        const val = valueKey || item.value

        if (!key || key === "name") {
          return null
        }

        const { color, label } = _config[key as keyof typeof _config]

        return (
          <div key={item.dataKey} className="flex items-center justify-between gap-4">
            {!hideIndicator && <span className={cn("h-2 w-2 shrink-0 rounded-full", color && `bg-${color}`)} />}
            <div className="flex flex-1 justify-between">
              {label ? label : key}:<span className="font-mono font-medium tabular-nums">{val?.toLocaleString()}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.Legend>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Legend>
>(({ className, content, ...props }, ref) => (
  <RechartsPrimitive.Legend
    ref={ref}
    content={content || <ChartLegendContent />}
    className={cn("!h-auto !w-full", className)}
    {...props}
  />
))
ChartLegend.displayName = "ChartLegend"

const ChartLegendContent = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & {
    payload?: RechartsPrimitive.PayloadProps[]
  }
>(({ className, payload, ...props }, ref) => {
  const { config } = React.useContext(ChartContext)

  if (!payload || !config) {
    return null
  }

  return (
    <div ref={ref} className={cn("flex flex-wrap items-center justify-center gap-4", className)} {...props}>
      {payload.map((item) => {
        if (item.type === "none") {
          return null
        }

        const { color } = config[item.value as keyof typeof config]

        return (
          <div key={item.value} className="flex items-center gap-1.5">
            <span className={cn("h-3 w-3 shrink-0 rounded-full", color && `bg-${color}`)} />
            {item.value}
          </div>
        )
      })}
    </div>
  )
})
ChartLegendContent.displayName = "ChartLegendContent"

const ChartActiveShape = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.ActiveShape>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.ActiveShape>
>(({ className, ...props }, ref) => (
  <RechartsPrimitive.ActiveShape
    ref={ref}
    className={cn("stroke-slate-950 stroke-2 fill-slate-950", "dark:stroke-slate-50 dark:fill-slate-50", className)}
    {...props}
  />
))
ChartActiveShape.displayName = "ChartActiveShape"

const ChartCrosshair = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.Crosshair>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Crosshair>
>(({ className, ...props }, ref) => (
  <RechartsPrimitive.Crosshair
    ref={ref}
    className={cn("stroke-slate-100 stroke-dasharray-3", "dark:stroke-slate-800", className)}
    {...props}
  />
))
ChartCrosshair.displayName = "ChartCrosshair"

const ChartTooltip = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.Tooltip>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Tooltip>
>(({ className, content, ...props }, ref) => (
  <RechartsPrimitive.Tooltip
    ref={ref}
    content={content || <ChartTooltipContent config={config} />}
    className={cn("!bg-white dark:!bg-gray-950", className)}
    {...props}
  />
))
ChartTooltip.displayName = "ChartTooltip"

const ChartContext = React.createContext<{ config: ChartConfig } & Record<string, any>>({
  config: {},
})

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer> & {
  id: string
  config: ChartConfig
}) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={id}
        ref={containerRef}
        className={cn("flex h-[350px] w-full flex-col items-center justify-center", className)}
        {...props}
      >
        {mounted ? (
          <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
        ) : (
          <div className="flex h-[350px] w-full items-center justify-center text-muted-foreground">Loading...</div>
        )}
      </div>
    </ChartContext.Provider>
  )
}

const ChartTooltipContent = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & {
    hideLabel?: boolean
    hideIndicator?: boolean
    is
    nameKey?: string
    valueKey?: string
    payload?: RechartsPrimitive.PayloadProps[]
    config: ChartConfig
  }
>(({ className, hideLabel = false, hideIndicator = false, is, nameKey, valueKey, payload, config, ...props }, ref) => {
  if (!payload || !payload.length) {
    return null
  }

  const data = payload[0].payload
  const _config = config

  return (
    <div ref={ref} className={cn("grid min-w-[8rem] items-start text-xs", className)} {...props}>
      {!hideLabel && data.name && <div className="block text-sm font-medium">{data.name}</div>}
      {payload.map((item) => {
        const key = nameKey || item.dataKey || item.name
        const val = valueKey || item.value

        if (!key || key === "name") {
          return null
        }

        const { color, label } = _config[key as keyof typeof _config]

        return (
          <div key={item.dataKey} className="flex items-center justify-between gap-4">
            {!hideIndicator && <span className={cn("h-2 w-2 shrink-0 rounded-full", color && `bg-${color}`)} />}
            <div className="flex flex-1 justify-between">
              {label ? label : key}:<span className="font-mono font-medium tabular-nums">{val?.toLocaleString()}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.Legend>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Legend>
>(({ className, content, ...props }, ref) => (
  <RechartsPrimitive.Legend
    ref={ref}
    content={content || <ChartLegendContent />}
    className={cn("!h-auto !w-full", className)}
    {...props}
  />
))
ChartLegend.displayName = "ChartLegend"

const ChartLegendContent = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & {
    payload?: RechartsPrimitive.PayloadProps[]
  }
>(({ className, payload, ...props }, ref) => {
  const { config } = React.useContext(ChartContext)

  if (!payload || !config) {
    return null
  }

  return (
    <div ref={ref} className={cn("flex flex-wrap items-center justify-center gap-4", className)} {...props}>
      {payload.map((item) => {
        if (item.type === "none") {
          return null
        }

        const { color } = config[item.value as keyof typeof config]

        return (
          <div key={item.value} className="flex items-center gap-1.5">
            <span className={cn("h-3 w-3 shrink-0 rounded-full", color && `bg-${color}`)} />
            {item.value}
          </div>
        )
      })}
    </div>
  )
})
ChartLegendContent.displayName = "ChartLegendContent"

const ChartActiveShape = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.ActiveShape>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.ActiveShape>
>(({ className, ...props }, ref) => (
  <RechartsPrimitive.ActiveShape
    ref={ref}
    className={cn("stroke-slate-950 stroke-2 fill-slate-950", "dark:stroke-slate-50 dark:fill-slate-50", className)}
    {...props}
  />
))
ChartActiveShape.displayName = "ChartActiveShape"

const ChartCrosshair = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.Crosshair>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Crosshair>
>(({ className, ...props }, ref) => (
  <RechartsPrimitive.Crosshair
    ref={ref}
    className={cn("stroke-slate-100 stroke-dasharray-3", "dark:stroke-slate-800", className)}
    {...props}
  />
))
ChartCrosshair.displayName = "ChartCrosshair"

const ChartTooltip = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.Tooltip>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Tooltip>
>(({ className, content, ...props }, ref) => (
  <RechartsPrimitive.Tooltip
    ref={ref}
    content={content || <ChartTooltipContent config={config} />}
    className={cn("!bg-white dark:!bg-gray-950", className)}
    {...props}
  />
))
ChartTooltip.displayName = "ChartTooltip"

const ChartContext = React.createContext<{ config: ChartConfig } & Record<string, any>>({
  config: {},
})

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer> & {
  id: string
  config: ChartConfig
}) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={id}
        ref={containerRef}
        className={cn("flex h-[350px] w-full flex-col items-center justify-center", className)}
        {...props}
      >
        {mounted ? (
          <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
        ) : (
          <div className="flex h-[350px] w-full items-center justify-center text-muted-foreground">Loading...</div>
        )}
      </div>
    </ChartContext.Provider>
  )
}

const ChartTooltipContent = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & {
    hideLabel?: boolean
    hideIndicator?: boolean
    is
    nameKey?: string
    valueKey?: string
    payload?: RechartsPrimitive.PayloadProps[]
    config: ChartConfig
  }
>(({ className, hideLabel = false, hideIndicator = false, is, nameKey, valueKey, payload, config, ...props }, ref) => {
  if (!payload || !payload.length) {
    return null
  }

  const data = payload[0].payload
  const _config = config

  return (
    <div ref={ref} className={cn("grid min-w-[8rem] items-start text-xs", className)} {...props}>
      {!hideLabel && data.name && <div className="block text-sm font-medium">{data.name}</div>}
      {payload.map((item) => {
        const key = nameKey || item.dataKey || item.name
        const val = valueKey || item.value

        if (!key || key === "name") {
          return null
        }

        const { color, label } = _config[key as keyof typeof _config]

        return (
          <div key={item.dataKey} className="flex items-center justify-between gap-4">
            {!hideIndicator && <span className={cn("h-2 w-2 shrink-0 rounded-full", color && `bg-${color}`)} />}
            <div className="flex flex-1 justify-between">
              {label ? label : key}:<span className="font-mono font-medium tabular-nums">{val?.toLocaleString()}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.Legend>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Legend>
>(({ className, content, ...props }, ref) => (
  <RechartsPrimitive.Legend
    ref={ref}
    content={content || <ChartLegendContent />}
    className={cn("!h-auto !w-full", className)}
    {...props}
  />
))
ChartLegend.displayName = "ChartLegend"

const ChartLegendContent = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & {
    payload?: RechartsPrimitive.PayloadProps[]
  }
>(({ className, payload, ...props }, ref) => {
  const { config } = React.useContext(ChartContext)

  if (!payload || !config) {
    return null
  }

  return (
    <div ref={ref} className={cn("flex flex-wrap items-center justify-center gap-4", className)} {...props}>
      {payload.map((item) => {
        if (item.type === "none") {
          return null
        }

        const { color } = config[item.value as keyof typeof config]

        return (
          <div key={item.value} className="flex items-center gap-1.5">
            <span className={cn("h-3 w-3 shrink-0 rounded-full", color && `bg-${color}`)} />
            {item.value}
          </div>
        )
      })}
    </div>
  )
})
ChartLegendContent.displayName = "ChartLegendContent"

const ChartActiveShape = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.ActiveShape>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.ActiveShape>
>(({ className, ...props }, ref) => (
  <RechartsPrimitive.ActiveShape
    ref={ref}
    className={cn("stroke-slate-950 stroke-2 fill-slate-950", "dark:stroke-slate-50 dark:fill-slate-50", className)}
    {...props}
  />
))
ChartActiveShape.displayName = "ChartActiveShape"

const ChartCrosshair = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.Crosshair>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Crosshair>
>(({ className, ...props }, ref) => (
  <RechartsPrimitive.Crosshair
    ref={ref}
    className={cn("stroke-slate-100 stroke-dasharray-3", "dark:stroke-slate-800", className)}
    {...props}
  />
))
ChartCrosshair.displayName = "ChartCrosshair"

const ChartTooltip = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.Tooltip>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Tooltip>
>(({ className, content, ...props }, ref) => (
  <RechartsPrimitive.Tooltip
    ref={ref}
    content={content || <ChartTooltipContent config={config} />}
    className={cn("!bg-white dark:!bg-gray-950", className)}
    {...props}
  />
))
ChartTooltip.displayName = "ChartTooltip"

const ChartContext = React.createContext<{ config: ChartConfig } & Record<string, any>>({
  config: {},
})

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer> & {
  id: string
  config: ChartConfig
}) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={id}
        ref={containerRef}
        className={cn("flex h-[350px] w-full flex-col items-center justify-center", className)}
        {...props}
      >
        {mounted ? (
          <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
        ) : (
          <div className="flex h-[350px] w-full items-center justify-center text-muted-foreground">Loading...</div>
        )}
      </div>
    </ChartContext.Provider>
  )
}

const ChartTooltipContent = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & {
    hideLabel?: boolean
    hideIndicator?: boolean
    is
    nameKey?: string
    valueKey?: string
    payload?: RechartsPrimitive.PayloadProps[]
    config: ChartConfig
  }
>(({ className, hideLabel = false, hideIndicator = false, is, nameKey, valueKey, payload, config, ...props }, ref) => {
  if (!payload || !payload.length) {
    return null
  }

  const data = payload[0].payload
  const _config = config

  return (
    <div ref={ref} className={cn("grid min-w-[8rem] items-start text-xs", className)} {...props}>
      {!hideLabel && data.name && <div className="block text-sm font-medium">{data.name}</div>}
      {payload.map((item) => {
        const key = nameKey || item.dataKey || item.name
        const val = valueKey || item.value

        if (!key || key === "name") {
          return null
        }

        const { color, label } = _config[key as keyof typeof _config]

        return (
          <div key={item.dataKey} className="flex items-center justify-between gap-4">
            {!hideIndicator && <span className={cn("h-2 w-2 shrink-0 rounded-full", color && `bg-${color}`)} />}
            <div className="flex flex-1 justify-between">
              {label ? label : key}:<span className="font-mono font-medium tabular-nums">{val?.toLocaleString()}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.Legend>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Legend>
>(({ className, content, ...props }, ref) => (
  <RechartsPrimitive.Legend
    ref={ref}
    content={content || <ChartLegendContent />}
    className={cn("!h-auto !w-full", className)}
    {...props}
  />
))
ChartLegend.displayName = "ChartLegend"

const ChartLegendContent = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & {
    payload?: RechartsPrimitive.PayloadProps[]
  }
>(({ className, payload, ...props }, ref) => {
  const { config } = React.useContext(ChartContext)

  if (!payload || !config) {
    return null
  }

  return (
    <div ref={ref} className={cn("flex flex-wrap items-center justify-center gap-4", className)} {...props}>
      {payload.map((item) => {
        if (item.type === "none") {
          return null
        }

        const { color } = config[item.value as keyof typeof config]

        return (
          <div key={item.value} className="flex items-center gap-1.5">
            <span className={cn("h-3 w-3 shrink-0 rounded-full", color && `bg-${color}`)} />
            {item.value}
          </div>
        )
      })}
    </div>
  )
})
ChartLegendContent.displayName = "ChartLegendContent"

const ChartActiveShape = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.ActiveShape>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.ActiveShape>
>(({ className, ...props }, ref) => (
  <RechartsPrimitive.ActiveShape
    ref={ref}
    className={cn("stroke-slate-950 stroke-2 fill-slate-950", "dark:stroke-slate-50 dark:fill-slate-50", className)}
    {...props}
  />
))
ChartActiveShape.displayName = "ChartActiveShape"

const ChartCrosshair = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.Crosshair>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Crosshair>
>(({ className, ...props }, ref) => (
  <RechartsPrimitive.Crosshair
    ref={ref}
    className={cn("stroke-slate-100 stroke-dasharray-3", "dark:stroke-slate-800", className)}
    {...props}
  />
))
ChartCrosshair.displayName = "ChartCrosshair"

const ChartTooltip = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.Tooltip>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Tooltip>
>(({ className, content, ...props }, ref) => (
  <RechartsPrimitive.Tooltip
    ref={ref}
    content={content || <ChartTooltipContent config={config} />}
    className={cn("!bg-white dark:!bg-gray-950", className)}
    {...props}
  />
))
ChartTooltip.displayName = "ChartTooltip"

const ChartContext = React.createContext<{ config: ChartConfig } & Record<string, any>>({
  config: {},
})

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer> & {
  id: string
  config: ChartConfig
}) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={id}
        ref={containerRef}
        className={cn("flex h-[350px] w-full flex-col items-center justify-center", className)}
        {...props}
      >
        {mounted ? (
          <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
        ) : (
          <div className="flex h-[350px] w-full items-center justify-center text-muted-foreground">Loading...</div>
        )}
      </div>
    </ChartContext.Provider>
  )
}

const ChartTooltipContent = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & {
    hideLabel?: boolean
    hideIndicator?: boolean
    is
    nameKey?: string
    valueKey?: string
    payload?: RechartsPrimitive.PayloadProps[]
    config: ChartConfig
  }
>(({ className, hideLabel = false, hideIndicator = false, is, nameKey, valueKey, payload, config, ...props }, ref) => {
  if (!payload || !payload.length) {
    return null
  }

  const data = payload[0].payload
  const _config = config

  return (
    <div ref={ref} className={cn("grid min-w-[8rem] items-start text-xs", className)} {...props}>
      {!hideLabel && data.name && <div className="block text-sm font-medium">{data.name}</div>}
      {payload.map((item) => {
        const key = nameKey || item.dataKey || item.name
        const val = valueKey || item.value

        if (!key || key === "name") {
          return null
        }

        const { color, label } = _config[key as keyof typeof _config]

        return (
          <div key={item.dataKey} className="flex items-center justify-between gap-4">
            {!hideIndicator && <span className={cn("h-2 w-2 shrink-0 rounded-full", color && `bg-${color}`)} />}
            <div className="flex flex-1 justify-between">
              {label ? label : key}:<span className="font-mono font-medium tabular-nums">{val?.toLocaleString()}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.Legend>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Legend>
>(({ className, content, ...props }, ref) => (
  <RechartsPrimitive.Legend
    ref={ref}
    content={content || <ChartLegendContent />}
    className={cn("!h-auto !w-full", className)}
    {...props}
  />
))
ChartLegend.displayName = "ChartLegend"

const ChartLegendContent = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & {
    payload?: RechartsPrimitive.PayloadProps[]
  }
>(({ className, payload, ...props }, ref) => {
  const { config } = React.useContext(ChartContext)

  if (!payload || !config) {
    return null
  }

  return (
    <div ref={ref} className={cn("flex flex-wrap items-center justify-center gap-4", className)} {...props}>
      {payload.map((item) => {
        if (item.type === "none") {
          return null
        }

        const { color } = config[item.value as keyof typeof config]

        return (
          <div key={item.value} className="flex items-center gap-1.5">
            <span className={cn("h-3 w-3 shrink-0 rounded-full", color && `bg-${color}`)} />
            {item.value}
          </div>
        )
      })}
    </div>
  )
})
ChartLegendContent.displayName = "ChartLegendContent"

const ChartActiveShape = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.ActiveShape>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.ActiveShape>
>(({ className, ...props }, ref) => (
  <RechartsPrimitive.ActiveShape
    ref={ref}
    className={cn("stroke-slate-950 stroke-2 fill-slate-950", "dark:stroke-slate-50 dark:fill-slate-50", className)}
    {...props}
  />
))
ChartActiveShape.displayName = "ChartActiveShape"

const ChartCrosshair = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.Crosshair>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Crosshair>
>(({ className, ...props }, ref) => (
  <RechartsPrimitive.Crosshair
    ref={ref}
    className={cn("stroke-slate-100 stroke-dasharray-3", "dark:stroke-slate-800", className)}
    {...props}
  />
))
ChartCrosshair.displayName = "ChartCrosshair"

const ChartTooltip = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.Tooltip>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Tooltip>
>(({ className, content, ...props }, ref) => (
  <RechartsPrimitive.Tooltip
    ref={ref}
    content={content || <ChartTooltipContent config={config} />}
    className={cn("!bg-white dark:!bg-gray-950", className)}
    {...props}
  />
))
ChartTooltip.displayName = "ChartTooltip"

const ChartContext = React.createContext<{ config: ChartConfig } & Record<string, any>>({
  config: {},
})

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer> & {
  id: string
  config: ChartConfig
}) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={id}
        ref={containerRef}
        className={cn("flex h-[350px] w-full flex-col items-center justify-center", className)}
        {...props}
      >
        {mounted ? (
          <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
        ) : (
          <div className="flex h-[350px] w-full items-center justify-center text-muted-foreground">Loading...</div>
        )}
      </div>
    </ChartContext.Provider>
  )
}

const ChartTooltipContent = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & {
    hideLabel?: boolean
    hideIndicator?: boolean
    is
    nameKey?: string
    valueKey?: string
    payload?: RechartsPrimitive.PayloadProps[]
    config: ChartConfig
  }
>(({ className, hideLabel = false, hideIndicator = false, is, nameKey, valueKey, payload, config, ...props }, ref) => {
  if (!payload || !payload.length) {
    return null
  }

  const data = payload[0].payload
  const _config = config

  return (
    <div ref={ref} className={cn("grid min-w-[8rem] items-start text-xs", className)} {...props}>
      {!hideLabel && data.name && <div className="block text-sm font-medium">{data.name}</div>}
      {payload.map((item) => {
        const key = nameKey || item.dataKey || item.name
        const val = valueKey || item.value

        if (!key || key === "name") {
          return null
        }

        const { color, label } = _config[key as keyof typeof _config]

        return (
          <div key={item.dataKey} className="flex items-center justify-between gap-4">
            {!hideIndicator && <span className={cn("h-2 w-2 shrink-0 rounded-full", color && `bg-${color}`)} />}
            <div className="flex flex-1 justify-between">
              {label ? label : key}:<span className="font-mono font-medium tabular-nums">{val?.toLocaleString()}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.Legend>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Legend>
>(({ className, content, ...props }, ref) => (
  <RechartsPrimitive.Legend
    ref={ref}
    content={content || <ChartLegendContent />}
    className={cn("!h-auto !w-full", className)}
    {...props}
  />
))
ChartLegend.displayName = "ChartLegend"

const ChartLegendContent = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & {
    payload?: RechartsPrimitive.PayloadProps[]
  }
>(({ className, payload, ...props }, ref) => {
  const { config } = React.useContext(ChartContext)

  if (!payload || !config) {
    return null
  }

  return (
    <div ref={ref} className={cn("flex flex-wrap items-center justify-center gap-4", className)} {...props}>
      {payload.map((item) => {
        if (item.type === "none") {
          return null
        }

        const { color } = config[item.value as keyof typeof config]

        return (
          <div key={item.value} className="flex items-center gap-1.5">
            <span className={cn("h-3 w-3 shrink-0 rounded-full", color && `bg-${color}`)} />
            {item.value}
          </div>
        )
      })}
    </div>
  )
})
ChartLegendContent.displayName = "ChartLegendContent"

const ChartActiveShape = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.ActiveShape>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.ActiveShape>
>(({ className, ...props }, ref) => (
  <RechartsPrimitive.ActiveShape
    ref={ref}
    className={cn("stroke-slate-950 stroke-2 fill-slate-950", "dark:stroke-slate-50 dark:fill-slate-50", className)}
    {...props}
  />
))
ChartActiveShape.displayName = "ChartActiveShape"

const ChartCrosshair = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.Crosshair>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Crosshair>
>(({ className, ...props }, ref) => (
  <RechartsPrimitive.Crosshair
    ref={ref}
    className={cn("stroke-slate-100 stroke-dasharray-3", "dark:stroke-slate-800", className)}
    {...props}
  />
))
ChartCrosshair.displayName = "ChartCrosshair"

const ChartTooltip = React.forwardRef<
  React.ElementRef<typeof RechartsPrimitive.Tooltip>,
  React.ComponentPropsWithoutRef<typeof RechartsPrimitive.Tooltip>
>(({ className, content, ...props }, ref) => (
  <RechartsPrimitive.Tooltip
    ref={ref}
    content={content || <ChartTooltipContent config={config} />}
    className={cn("!bg-white dark:!bg-gray-950", className)}
    {...props}
  />
))
ChartTooltip.displayName = "ChartTooltip"

const ChartContext = React.createContext<{ config: ChartConfig } & Record<string, any>>({
  config: {},
})

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer> & {
  id: string
  config: ChartConfig
}) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={id}
        ref={containerRef}
        className={cn("flex h-[350px] w-full flex-col items-center justify-center", className)}
        {...props}
      >
        {mounted ? (
          <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
        ) : (
          <div className="flex h-[350px] w-full items-center justify-center text-muted-foreground">Loading...</div>
        )}
      </div>
    </ChartContext.Provider>
  )
}

const ChartTooltipContent = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & {
    hideLabel?: boolean
    hideIndicator?: boolean
    is
    nameKey?: string
    valueKey?: string
    payload?: RechartsPrimitive.PayloadProps[]
    config: ChartConfig
  }
>(
  (
    {
      className,
      hideLabel = false,
      hideIndicator = false,
      is,
      nameKey,
      valueKey,
      payload,
      config,
      ...props
    },
    ref,
  ) => {
    if (!payload || !payload.length) {
      return null
    }

    const data = payload[0].payload
    const _config = config

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start text-xs",
          className,
        )}
        {...props}
      >
        {!hideLabel && data.name && (
          <div className="block text-sm font-medium">
            {data.name}
          </div>
        )}
        {payload.map((item) => {
          const key = nameKey || item.dataKey || item.name
          const val = valueKey || item.value

          if (!key || key === "name") {
            return null
          }

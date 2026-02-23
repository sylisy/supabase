import { cn } from 'ui'

interface QueryInsightsHealthMetricProps {
  label: string
  value: number | string | undefined
  className?: string
}

export const QueryInsightsHealthMetric = ({ label, value, className }: QueryInsightsHealthMetricProps) => {
  return (
    <div className={cn("font-mono text-xs flex items-center justify-between px-4 py-2 uppercase h-10", className)}>
      <span className="text-foreground-lighter tracking-wider truncate">{label}</span>
      <span className="text-foreground font-medium tabular-nums">{value}</span>
    </div>
  )
}

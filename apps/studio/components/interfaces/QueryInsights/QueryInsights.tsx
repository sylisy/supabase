import { QueryInsightsHealth } from './QueryInsightsHealth/QueryInsightsHealth'

interface QueryInsightsProps {
  dateRange?: {
    period_start: { date: string; time_period: string }
    period_end: { date: string; time_period: string }
    interval: string
  }
  onDateRangeChange?: (from: string, to: string) => void
}

export const QueryInsights = ({ dateRange, onDateRangeChange }: QueryInsightsProps) => {
  return (
    <div>
      <QueryInsightsHealth data={[]} isLoading={false} />
      {/* Chart here */}
      {/* Table here */}
    </div>
  )
}

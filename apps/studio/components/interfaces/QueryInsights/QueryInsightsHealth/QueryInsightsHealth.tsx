import { useQueryInsightsIssues } from '../hooks/useQueryInsightsIssues'
import { useQueryInsightsScore } from '../hooks/useQueryInsightsScore'
import { HEALTH_COLORS, HEALTH_LEVELS, getHealthLevel } from './QueryInsightsHealth.constants'
import type { QueryPerformanceRow } from '../../QueryPerformance/QueryPerformance.types'
import { QueryInsightsHealthMetric } from './QueryInsightsHealthMetric'
import { cn } from 'ui'

interface QueryInsightsHealthProps {
  data: QueryPerformanceRow[]
  isLoading: boolean
}

export const QueryInsightsHealth = ({ data, isLoading }: QueryInsightsHealthProps) => {
  const { errors, indexIssues, slowQueries } = useQueryInsightsIssues(data)
  const { score, level } = useQueryInsightsScore({ errors, indexIssues, slowQueries })

  const color = HEALTH_COLORS[level]
  const label = HEALTH_LEVELS[level].label

  return (
    <div className="w-full border-b flex items-center">
      <div className="px-6 py-3 flex items-center gap-4">
        <div
          className="h-14 w-14 rounded-full flex items-center justify-center"
          style={{
            background: `conic-gradient(${color} ${score * 3.6}deg, hsl(var(--border-default)) ${score * 3.6}deg)`,
          }}
        >
          <div className="h-12 w-12 rounded-full bg-studio flex items-center justify-center text-xl font-medium" style={{ color }}>
            {score}
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-medium text-foreground-light uppercase font-mono tracking-wider">Health Score</span>
          <span className="text-xl text-foreground-light" style={{ color }}>{label}</span>
        </div>
      </div>
      <div className="flex-1 border-l h-full">
        <div className="grid grid-cols-2">
          <QueryInsightsHealthMetric label="Average P95" value={0} className="border-b" />
          <QueryInsightsHealthMetric label="Total Calls" value={0} className="border-l border-b" />
          <QueryInsightsHealthMetric label="Total Rows Read" value={0} />
          <QueryInsightsHealthMetric label="Cache Hit Rate" value={0} className="border-l" />
        </div>
      </div>
    </div>
  )
}

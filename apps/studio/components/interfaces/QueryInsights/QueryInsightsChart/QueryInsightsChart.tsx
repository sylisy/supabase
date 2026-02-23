import { useMemo, useState } from 'react'
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Tabs_Shadcn_, TabsContent_Shadcn_, TabsList_Shadcn_, TabsTrigger_Shadcn_ } from 'ui'
import { Loader2 } from 'lucide-react'
import type { ChartDataPoint } from '../../QueryPerformance/QueryPerformance.types'
import { useTheme } from 'next-themes'
import { QueryInsightsChartTooltip } from './QueryInsightsChartTooltip'
import { CHART_TABS, LEGEND_ITEMS } from './QueryInsightsChart.constants'
import { formatTime } from './QueryInsightsChart.utils'

interface QueryInsightsChartProps {
  chartData: ChartDataPoint[]
  isLoading: boolean
}

export const QueryInsightsChart = ({ chartData, isLoading }: QueryInsightsChartProps) => {
  const [selectedMetric, setSelectedMetric] = useState('query_latency')
  const { resolvedTheme } = useTheme()
  const isDarkMode = resolvedTheme?.includes('dark')
  const data = useMemo(() => {
    return chartData.map((d) => ({
      time: d.period_start > 1e13 ? Math.floor(d.period_start / 1000) : d.period_start,
      p50: d.p50_time,
      p95: d.p95_time,
      rows_read: d.rows_read,
      calls: d.calls,
      cache_hits: d.cache_hits,
    }))
  }, [chartData])

  return (
    <div className="bg-surface-200 border-b">
      <Tabs_Shadcn_
        value={selectedMetric}
        onValueChange={(value) => setSelectedMetric(value)}
        className="w-full"
      >
        <TabsList_Shadcn_ className="flex justify-start rounded-none gap-x-4 border-b !mt-0 pt-0 px-6">
          {CHART_TABS.map((tab) => (
            <TabsTrigger_Shadcn_
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-2 text-xs py-3 border-b-[1px] font-mono uppercase"
            >
              {tab.label}
            </TabsTrigger_Shadcn_>
          ))}
        </TabsList_Shadcn_>

        <TabsContent_Shadcn_ value={selectedMetric} className="bg-surface-200 mt-0">
          <div className="w-full py-4 flex flex-col">
            {/* Legend */}
            <div className="flex gap-4 mb-4 px-6">
              {LEGEND_ITEMS[selectedMetric]?.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-1.5 text-[11px] uppercase font-mono text-foreground"
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.label}
                </div>
              ))}
            </div>

            <div className="w-full h-[170px] px-0">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 size={20} className="animate-spin text-foreground-lighter" />
                </div>
              ) : data.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-foreground-lighter">No data available</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  {selectedMetric === 'query_latency' ? (
                    <AreaChart data={data} margin={{ top: 4, left: 0, right: 0, bottom: 4 }}>
                      <defs>
                        <linearGradient id="gradientP95" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#65BCD9" stopOpacity={0.15} />
                          <stop offset="100%" stopColor="#65BCD9" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Tooltip
                        content={<QueryInsightsChartTooltip />}
                        cursor={{
                          stroke: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                          strokeWidth: 1,
                        }}
                      />
                      <Area
                        type="linear"
                        dataKey="p95"
                        stroke="#65BCD9"
                        strokeWidth={1}
                        fill="url(#gradientP95)"
                        dot={false}
                        name="P95"
                      />
                      <Area
                        type="linear"
                        dataKey="p50"
                        stroke="#8B5CF6"
                        strokeWidth={1}
                        fill="none"
                        dot={false}
                        name="P50"
                      />
                    </AreaChart>
                  ) : (
                    <AreaChart data={data} margin={{ top: 4, left: 0, right: 0, bottom: 4 }}>
                      <defs>
                        <linearGradient id="gradientMetric" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="0%"
                            stopColor={LEGEND_ITEMS[selectedMetric]?.[0]?.color ?? '#3ECF8E'}
                            stopOpacity={0.15}
                          />
                          <stop
                            offset="100%"
                            stopColor={LEGEND_ITEMS[selectedMetric]?.[0]?.color ?? '#3ECF8E'}
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <Tooltip
                        content={<QueryInsightsChartTooltip />}
                        cursor={{
                          stroke: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                          strokeWidth: 1,
                        }}
                      />
                      <Area
                        type="linear"
                        dataKey={selectedMetric}
                        stroke={LEGEND_ITEMS[selectedMetric]?.[0]?.color ?? '#3ECF8E'}
                        strokeWidth={1}
                        fill="url(#gradientMetric)"
                        dot={false}
                        name={LEGEND_ITEMS[selectedMetric]?.[0]?.label ?? ''}
                      />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              )}
            </div>
            {data.length > 0 && (
              <div className="flex justify-between text-xs text-foreground-lighter pt-2 px-6">
                <span>{formatTime(data[0].time)}</span>
                <span>{formatTime(data[data.length - 1].time)}</span>
              </div>
            )}
          </div>
        </TabsContent_Shadcn_>
      </Tabs_Shadcn_>
    </div>
  )
}

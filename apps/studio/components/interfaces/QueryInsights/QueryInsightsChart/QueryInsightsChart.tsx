import { useState } from 'react'
import {
  Area,
  AreaChart,
  Line,
  ResponsiveContainer,
  XAxis,
  Tooltip,
} from 'recharts'
import {
  Tabs_Shadcn_,
  TabsContent_Shadcn_,
  TabsList_Shadcn_,
  TabsTrigger_Shadcn_,
} from 'ui'

const CHART_TABS = [
  { id: 'query_latency', label: 'Query latency' },
  { id: 'rows_read', label: 'Rows read' },
  { id: 'calls', label: 'Calls' },
  { id: 'cache_hits', label: 'Cache hits' },
]

const LEGEND_ITEMS: Record<string, { label: string; color: string }[]> = {
  query_latency: [
    { label: 'P50', color: '#8B5CF6' },
    { label: 'P95', color: '#65BCD9' },
  ],
  rows_read: [{ label: 'Rows Read', color: '#3ECF8E' }],
  calls: [{ label: 'Calls', color: '#3ECF8E' }],
  cache_hits: [{ label: 'Cache Hits', color: '#10B981' }],
}

// Dummy data - will be replaced with real data later
const DUMMY_DATA = Array.from({ length: 60 }, (_, i) => {
  const time = new Date(2026, 1, 23, 23, 30 + i).getTime()
  return {
    time,
    p50: 40 + Math.random() * 20,
    p95: 80 + Math.random() * 40,
    rows_read: 800 + Math.random() * 600,
    calls: 100 + Math.random() * 80,
    cache_hits: 950 + Math.random() * 50,
  }
})

const formatTime = (value: number) => {
  const d = new Date(value)
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export const QueryInsightsChart = () => {
  const [selectedMetric, setSelectedMetric] = useState('query_latency')

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
                <div key={item.label} className="flex items-center gap-1.5 text-[11px] uppercase font-mono text-foreground">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.label}
                </div>
              ))}
            </div>

            <div className="w-full h-[160px] px-0">
              <ResponsiveContainer width="100%" height="100%">
                {selectedMetric === 'query_latency' ? (
                  <AreaChart data={DUMMY_DATA} margin={{ top: 0, left: 0, right: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradientP95" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#65BCD9" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="#65BCD9" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Tooltip
                      labelFormatter={formatTime}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background-default))',
                        border: '1px solid hsl(var(--border-default))',
                        borderRadius: 6,
                        fontSize: 12,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="p95"
                      stroke="#65BCD9"
                      strokeWidth={1}
                      fill="url(#gradientP95)"
                      dot={false}
                      name="P95"
                    />
                    <Line
                      type="monotone"
                      dataKey="p50"
                      stroke="#8B5CF6"
                      strokeWidth={1}
                      dot={false}
                      name="P50"
                    />
                  </AreaChart>
                ) : (
                  <AreaChart data={DUMMY_DATA} margin={{ top: 0, left: 0, right: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradientMetric" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={LEGEND_ITEMS[selectedMetric]?.[0]?.color ?? '#3ECF8E'} stopOpacity={0.15} />
                        <stop offset="100%" stopColor={LEGEND_ITEMS[selectedMetric]?.[0]?.color ?? '#3ECF8E'} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Tooltip
                      labelFormatter={formatTime}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background-default))',
                        border: '1px solid hsl(var(--border-default))',
                        borderRadius: 6,
                        fontSize: 12,
                      }}
                    />
                    <Area
                      type="monotone"
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
            </div>

            <div className="flex justify-between text-xs text-foreground-lighter pt-2 px-6">
              <span>Feb 23, 2026 10:00 AM</span>
              <span>Feb 23, 2026 11:00 AM</span>
            </div>
          </div>
        </TabsContent_Shadcn_>
      </Tabs_Shadcn_>
    </div>
  )
}
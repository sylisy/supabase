import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { Bar, BarChart, CartesianGrid, Cell, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltipContent } from 'ui'
import { CHART_COLORS } from 'components/ui/Charts/Charts.constants'
import type { ChartConfig } from 'components/ui/QueryBlock/QueryBlock.types'

interface SQLQueryChartProps {
  results: any[]
  chartConfig: ChartConfig
}

function getCumulativeResults(data: { rows: readonly any[] }, config: ChartConfig): any[] {
  const { xKey, yKey } = config
  if (!xKey || !yKey) return data.rows as any[]

  let cumulative = 0
  return data.rows.map((row) => {
    cumulative += Number(row[yKey]) || 0
    return {
      ...row,
      [yKey]: cumulative,
    }
  })
}

export function SQLQueryChart({ results, chartConfig }: SQLQueryChartProps) {
  const { xKey, yKey, cumulative = false } = chartConfig
  const [focusDataIndex, setFocusDataIndex] = useState<number>()

  const formattedQueryResult = useMemo(() => {
    return results?.map((row) => {
      return Object.fromEntries(
        Object.entries(row).map(([key, value]) => {
          if (key === yKey) return [key, Number(value)]
          return [key, value]
        })
      )
    })
  }, [results, yKey])

  const chartData = cumulative
    ? getCumulativeResults({ rows: formattedQueryResult ?? [] }, chartConfig)
    : formattedQueryResult

  const getDateFormat = (key: string) => {
    const value = chartData?.[0]?.[key] || ''
    if (typeof value === 'number') return 'number'
    if (dayjs(value).isValid()) return 'date'
    return 'string'
  }

  const xKeyDateFormat = getDateFormat(xKey)

  if (!xKey || !yKey) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-foreground-light">Select columns for the X and Y axes</p>
      </div>
    )
  }

  return (
    <div className="flex-1 w-full">
      <ChartContainer
        className="aspect-auto px-3 py-2"
        style={{ height: '230px', minHeight: '230px' }}
      >
        <BarChart
          accessibilityLayer
          margin={{ left: -20, right: 0, top: 10 }}
          data={chartData}
          onMouseMove={(e: any) => {
            if (e.activeTooltipIndex !== focusDataIndex) {
              setFocusDataIndex(e.activeTooltipIndex)
            }
          }}
          onMouseLeave={() => setFocusDataIndex(undefined)}
        >
          <CartesianGrid vertical={false} stroke={CHART_COLORS.AXIS} />
          <XAxis
            dataKey={xKey}
            tickLine={{ stroke: CHART_COLORS.AXIS }}
            axisLine={{ stroke: CHART_COLORS.AXIS }}
            interval="preserveStartEnd"
            tickMargin={4}
            minTickGap={32}
            tickFormatter={(value) =>
              xKeyDateFormat === 'date' ? dayjs(value).format('MMM D YYYY HH:mm') : value
            }
          />
          <YAxis tickLine={false} axisLine={false} tickMargin={4} />
          <Tooltip content={<ChartTooltipContent className="w-[150px]" />} />
          <Bar radius={1} dataKey={yKey}>
            {chartData?.map((_: any, index: number) => (
              <Cell
                key={`cell-${index}`}
                className="transition-all duration-100"
                fill="hsl(var(--chart-1))"
                opacity={focusDataIndex === undefined || focusDataIndex === index ? 1 : 0.4}
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  )
}

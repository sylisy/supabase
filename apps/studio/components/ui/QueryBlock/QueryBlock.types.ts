export type ChartConfig = {
  view?: 'table' | 'chart'
  type: 'bar' | 'line'
  cumulative: boolean
  xKey: string
  yKey: string
  showLabels?: boolean
  showGrid?: boolean
}

export const DEFAULT_CHART_CONFIG: ChartConfig = {
  type: 'bar',
  cumulative: false,
  xKey: '',
  yKey: '',
  showLabels: false,
  showGrid: false,
  view: 'table',
}

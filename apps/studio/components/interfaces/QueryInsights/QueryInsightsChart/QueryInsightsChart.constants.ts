export const CHART_TABS = [
  { id: 'query_latency', label: 'Query latency' },
  { id: 'rows_read', label: 'Rows read' },
  { id: 'calls', label: 'Calls' },
  { id: 'cache_hits', label: 'Cache hits' },
]

export const LEGEND_ITEMS: Record<string, { label: string; color: string }[]> = {
  query_latency: [
    { label: 'P50', color: '#8B5CF6' },
    { label: 'P95', color: '#65BCD9' },
  ],
  rows_read: [{ label: 'Rows Read', color: '#3ECF8E' }],
  calls: [{ label: 'Calls', color: '#3ECF8E' }],
  cache_hits: [{ label: 'Cache Hits', color: '#10B981' }],
}

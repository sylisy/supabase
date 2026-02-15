import { Auth, Database, Realtime, Storage } from 'icons'
import { Activity, ExternalLink, Shield } from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs_Shadcn_ as Tabs,
  TabsContent_Shadcn_ as TabsContent,
  TabsList_Shadcn_ as TabsList,
  TabsTrigger_Shadcn_ as TabsTrigger,
} from 'ui'

import { useMockProject } from '../providers/MockProjectContext'

// ─── Mock Data ──────────────────────────────────────────────────────────

const MOCK_STATS = { tables: 20, functions: 15, replicas: 0 }

const MOCK_USAGE_DATA = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  rest: Math.floor(Math.random() * 200 + 50),
  auth: Math.floor(Math.random() * 80 + 10),
  storage: Math.floor(Math.random() * 60 + 5),
  realtime: Math.floor(Math.random() * 40 + 5),
}))

const MOCK_SECURITY_LINTS = [
  'Function `public.sudo` has a role mutable search_path',
  'Function `public.sudo` has a role mutable search_path',
  'Function `public.get_storage_base_path` has a role mutable search_path',
  'Function `public.euro_worker` has a role mutable search_path',
  'Function `public.get_secret` has a role mutable search_path',
  'Function `public.add_cron_job` has a role mutable search_path',
]

const MOCK_SLOW_QUERIES = [
  { query: 'select edge.generate_embedding($1) limit $2', avgTime: '2.15s', calls: 8 },
  { query: 'select public.euro_worker( jsonb_build_object($1,$2))', avgTime: '4.10s', calls: 12 },
  { query: 'SELECT name FROM pg_timezone_names', avgTime: '0.47s', calls: 192 },
  { query: 'with table_info as ( select n.nspname::text as schem...', avgTime: '5.37s', calls: 1 },
  { query: 'with table_info as ( select n.nspname::text as schem...', avgTime: '5.26s', calls: 1 },
]

// ─── Mini Bar Chart (mocked) ────────────────────────────────────────────

function MiniBarChart({ data, color = '#3ECF8E' }: { data: number[]; color?: string }) {
  const max = Math.max(...data, 1)
  return (
    <div className="flex items-end gap-[2px] h-20 w-full">
      {data.map((val, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm min-h-[2px]"
          style={{
            height: `${(val / max) * 100}%`,
            backgroundColor: color,
            opacity: 0.7,
          }}
        />
      ))}
    </div>
  )
}

// ─── Usage Panel ────────────────────────────────────────────────────────

function UsagePanel({
  icon,
  title,
  metricLabel,
  data,
  total,
}: {
  icon: React.ReactNode
  title: string
  metricLabel: string
  data: number[]
  total: number
}) {
  return (
    <div className="rounded-md border bg-surface-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 space-y-4">
        <div className="flex items-center space-x-3 opacity-80">
          <div className="rounded bg-surface-300 p-1.5 text-foreground-light shadow-sm">{icon}</div>
          <h4 className="mb-0 text-lg">{title}</h4>
        </div>
        <div>
          <p className="text-xs text-foreground-lighter mb-1">{metricLabel}</p>
          <p className="text-xl tabular-nums text-foreground">{total.toLocaleString()}</p>
        </div>
        <MiniBarChart data={data} />
      </div>
    </div>
  )
}

// ─── Advisor Widget ─────────────────────────────────────────────────────

function MockAdvisorWidget() {
  const totalIssues = MOCK_SECURITY_LINTS.length

  return (
    <div className="@container">
      <div className="flex justify-between items-center mb-6">
        <h2>
          {totalIssues} issues need <span className="text-warning">attention</span>
        </h2>
      </div>
      <div style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }} className="grid gap-4">
        {/* Security / Performance Tabs */}
        <Card className="h-80">
          <Tabs defaultValue="security" className="h-full flex flex-col">
            <CardHeader className="h-10 py-0 pl-4 pr-2 flex flex-row items-center justify-between flex-0">
              <TabsList className="flex justify-start rounded-none gap-x-4 border-b-0 !mt-0 pt-0">
                <TabsTrigger
                  value="security"
                  className="flex items-center gap-2 text-xs py-3 border-b-[1px] font-mono uppercase"
                >
                  Security{' '}
                  <div className="rounded bg-warning text-warning-100 px-1">{totalIssues}</div>
                </TabsTrigger>
                <TabsTrigger
                  value="performance"
                  className="flex items-center gap-2 text-xs py-3 border-b-[1px] font-mono uppercase"
                >
                  Performance
                </TabsTrigger>
              </TabsList>
              <Button type="text" className="!mt-0 w-7" icon={<ExternalLink />} />
            </CardHeader>
            <CardContent className="!p-0 mt-0 flex-1 overflow-y-auto">
              <TabsContent value="security" className="p-0 mt-0 h-full">
                <ul>
                  {MOCK_SECURITY_LINTS.map((lint, i) => (
                    <li key={i} className="text-sm w-full border-b my-0 last:border-b-0 group px-4">
                      <div className="flex items-center gap-2 py-3">
                        <Shield
                          size={14}
                          strokeWidth={1.5}
                          className="text-foreground-muted flex-shrink-0"
                        />
                        <p className="font-mono text-xs text-foreground-light truncate">{lint}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </TabsContent>
              <TabsContent value="performance" className="p-0 mt-0 h-full">
                <div className="flex-1 flex flex-col h-full items-center justify-center gap-2">
                  <Shield size={20} strokeWidth={1.5} className="text-foreground-muted" />
                  <p className="text-sm text-foreground-light">No performance issues found</p>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        {/* Slow Queries */}
        <Card className="h-80 flex flex-col">
          <CardHeader className="h-10 flex-row items-center justify-between py-0 pl-4 pr-2">
            <CardTitle>Slow Queries</CardTitle>
            <Button type="text" className="!mt-0 w-7" icon={<ExternalLink />} />
          </CardHeader>
          <CardContent className="!p-0 flex-1 overflow-y-auto">
            <Table className="text-xs font-mono max-w-full mt-0">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-foreground-lighter truncate py-2 h-auto">
                    Query
                  </TableHead>
                  <TableHead className="text-foreground-lighter truncate py-2 h-auto">
                    Avg time
                  </TableHead>
                  <TableHead className="text-foreground-lighter truncate py-2 h-auto">
                    Calls
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_SLOW_QUERIES.map((q, i) => (
                  <TableRow key={i} className="py-2">
                    <TableCell className="font-mono truncate max-w-xs">{q.query}</TableCell>
                    <TableCell className="font-mono truncate max-w-xs">{q.avgTime}</TableCell>
                    <TableCell className="font-mono truncate max-w-xs">{q.calls}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ─── Home Screen ────────────────────────────────────────────────────────

export function HomeScreen() {
  const { project } = useMockProject()

  const restTotal = MOCK_USAGE_DATA.reduce((sum, d) => sum + d.rest, 0)
  const authTotal = MOCK_USAGE_DATA.reduce((sum, d) => sum + d.auth, 0)
  const storageTotal = MOCK_USAGE_DATA.reduce((sum, d) => sum + d.storage, 0)
  const realtimeTotal = MOCK_USAGE_DATA.reduce((sum, d) => sum + d.realtime, 0)

  return (
    <div className="w-full px-4">
      {/* Section 1: Header */}
      <div className="py-8 border-b border-muted">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center gap-6 justify-between w-full">
            <div className="flex flex-col md:flex-row md:items-end gap-3">
              <h1 className="text-3xl">{project.name}</h1>
              <div className="flex items-center gap-x-2 mb-1">
                <Badge variant="default">Nano</Badge>
              </div>
            </div>
            <div className="flex items-center gap-x-6">
              <div className="flex flex-col gap-y-1">
                <span className="text-foreground-light text-sm">Tables</span>
                <p className="text-2xl tabular-nums">{MOCK_STATS.tables}</p>
              </div>
              <div className="flex flex-col gap-y-1">
                <span className="text-foreground-light text-sm">Functions</span>
                <p className="text-2xl tabular-nums">{MOCK_STATS.functions}</p>
              </div>
              <div className="flex flex-col gap-y-1">
                <span className="text-foreground-light text-sm">Replicas</span>
                <p className="text-2xl tabular-nums">{MOCK_STATS.replicas}</p>
              </div>
              <div className="ml-6 pl-6 border-l flex items-center">
                <Button type="default" className="rounded-full">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-brand" />
                    Project Status
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Usage */}
      <div className="py-16 ">
        <div className="mx-auto max-w-7xl space-y-16 @container">
          <div className="space-y-6">
            <div className="flex flex-row items-center gap-x-2">
              <Button type="default" size="small">
                Last 24 hours
                <span className="ml-1 text-foreground-lighter">&#9662;</span>
              </Button>
              <span className="text-xs text-foreground-light">Statistics for last 24 hours</span>
            </div>
            <div
              style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}
              className="grid gap-4"
            >
              <UsagePanel
                icon={<Database strokeWidth={1.5} size={16} />}
                title="Database"
                metricLabel="REST Requests"
                data={MOCK_USAGE_DATA.map((d) => d.rest)}
                total={restTotal}
              />
              <UsagePanel
                icon={<Auth strokeWidth={1.5} size={16} />}
                title="Auth"
                metricLabel="Auth Requests"
                data={MOCK_USAGE_DATA.map((d) => d.auth)}
                total={authTotal}
              />
              <UsagePanel
                icon={<Storage strokeWidth={1.5} size={16} />}
                title="Storage"
                metricLabel="Storage Requests"
                data={MOCK_USAGE_DATA.map((d) => d.storage)}
                total={storageTotal}
              />
              <UsagePanel
                icon={<Realtime strokeWidth={1.5} size={16} />}
                title="Realtime"
                metricLabel="Realtime Connections"
                data={MOCK_USAGE_DATA.map((d) => d.realtime)}
                total={realtimeTotal}
              />
            </div>
          </div>

          {/* Advisor */}
          <MockAdvisorWidget />
        </div>
      </div>
    </div>
  )
}

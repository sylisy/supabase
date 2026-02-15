import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronsDown,
  ChevronsUpDown,
  Filter,
  Globe,
  Key,
  ListFilter,
  MoreVertical,
  Plus,
  Search,
  Table2,
} from 'lucide-react'
import { useRef, useState, type ChangeEvent } from 'react'
import { Button, cn } from 'ui'

// ─── Mock Tables ────────────────────────────────────────────────────────

interface MockTable {
  id: number
  name: string
  hasRls: boolean
  columns: MockColumn[]
  rows: Record<string, string | null>[]
}

interface MockColumn {
  name: string
  type: string
  isPrimary?: boolean
}

const HACKATHON_IDS = ['f47ac10b-58cc-4372-a567-0e02b2c3d500', '1a93ba5-f676-4d65-baa8-2fa3fdf...']

const MOCK_NAMES = [
  'SuperDuperAi',
  'Matthew Habtezgi',
  'Snap Banana',
  'BonAppeTeam',
  'Ittybit',
  'Peyote',
  'Table Review',
  'ScamSniper',
  '5-Dee Studios',
  'Moldable',
  'Pitched App',
  'MomentoAI',
  'Svelte Supabase Auth',
  "Women's Wellness Tracker",
  'Repatch',
  'My Events Super Base',
  'WhatTheStack?!',
  'PaintPal',
  'HotOrSlop',
  'Linkus',
  'Expressify',
  'Supa Events',
  'honk honk',
  'Alicia',
  'jsonMartin',
  'Kimchi',
  'Interfaze',
  'MexicoGPT',
  'call/cc',
  'DevDash',
  'SupaFlow',
  'CodeBuddy',
  'AIssistant',
  'DataVault',
  'CloudPilot',
  'PixelForge',
  'StreamLine',
  'NeuralNest',
  'ByteCraft',
  'FormStack',
  'QueryMaster',
  'SyncWave',
  'BlinkDB',
  'HexaGrid',
  'VectorVault',
  'GraphQL Hero',
  'AuthGuard',
  'EdgeRunner',
  'LambdaLab',
  'ServerPulse',
]

const MOCK_DESCRIPTIONS = [
  'AI Filmmaking Storyboard in Figma',
  'A mail platform for AI agents',
  'An AI-Powered Tower Defense Game Ger...',
  '2 homo sapiens with hands full of fingers.',
  null,
  null,
  'A Supabase-powered web app connectin...',
  null,
  'WZRD.Studio : Creative Interface to gene...',
  'make your app customizable',
  'Pitched reimagines online dating by lettin...',
  'Choose Your Mentor. Change Your Life. P...',
  "I'm working on extending the (now unsup...",
  'This application tracks health and wellne...',
  'Autogenerate AI patchnote newsletters a...',
  'My Events Super Base',
  'WhatTheStack?! is the simplest way to ch...',
  'A friendly painting app for Spectacles. Dr...',
  null,
  null,
  "It's augmentative communication mobile/...",
  null,
  'kill zombie costs on AWS instantly',
  null,
  null,
  null,
  'We think postgres should be able to call /...',
  'Building AI native solutions for LATAM',
  null,
  null,
  null,
  'Your AI pair programming companion',
  'An intelligent assistant for developers',
  'Secure data storage solution',
  'Cloud infrastructure manager',
  'Design tool for pixel art',
  'Workflow automation platform',
  'Neural network playground',
  'Byte-level data manipulation',
  'Dynamic form builder',
  'Advanced database query tool',
  'Real-time data synchronization',
  'Lightning fast database',
  'Hexagonal grid system',
  'Vector embedding storage',
  'GraphQL schema generator',
  'Authentication guard middleware',
  'Edge computing framework',
  'Serverless function lab',
  'Server monitoring dashboard',
]

function generateUUID(seed: number): string {
  const hex = (n: number) => n.toString(16).padStart(8, '0')
  return `${hex(seed)}-${hex(seed * 7).slice(0, 4)}-${hex(seed * 13).slice(0, 4)}-${hex(seed * 17).slice(0, 4)}-${hex(
    seed * 23
  )
    .padStart(12, '0')
    .slice(0, 12)}`
}

function generateTimestamp(seed: number): string {
  const base = new Date('2025-10-04T17:00:00Z')
  base.setSeconds(base.getSeconds() + seed * 86400 * Math.sin(seed))
  return base.toISOString().replace('T', ' ').replace('Z', '+00')
}

function generateSubmissionRows(): Record<string, string | null>[] {
  const rows: Record<string, string | null>[] = []
  for (let i = 0; i < 100; i++) {
    rows.push({
      id: generateUUID(i + 1000),
      hackathon_id: HACKATHON_IDS[i % 2],
      name: MOCK_NAMES[i % MOCK_NAMES.length],
      description: MOCK_DESCRIPTIONS[i % MOCK_DESCRIPTIONS.length],
      created_at: generateTimestamp(i),
    })
  }
  return rows
}

const SUBMISSIONS_TABLE: MockTable = {
  id: 1,
  name: 'submissions',
  hasRls: true,
  columns: [
    { name: 'id', type: 'uuid', isPrimary: true },
    { name: 'hackathon_id', type: 'uuid' },
    { name: 'name', type: 'text' },
    { name: 'description', type: 'text' },
    { name: 'created_at', type: 'timestamptz' },
  ],
  rows: generateSubmissionRows(),
}

const TEAMS_TABLE: MockTable = {
  id: 2,
  name: 'teams',
  hasRls: true,
  columns: [
    { name: 'id', type: 'uuid', isPrimary: true },
    { name: 'name', type: 'text' },
    { name: 'submission_id', type: 'uuid' },
    { name: 'created_at', type: 'timestamptz' },
  ],
  rows: Array.from({ length: 100 }, (_, i) => ({
    id: generateUUID(i + 5000),
    name: `Team ${MOCK_NAMES[i % MOCK_NAMES.length]}`,
    submission_id: generateUUID(i + 1000),
    created_at: generateTimestamp(i + 50),
  })),
}

const ALL_TABLES: MockTable[] = [SUBMISSIONS_TABLE, TEAMS_TABLE]

// ─── Mock Data Grid ─────────────────────────────────────────────────────

function MockDataGrid({ table }: { table: MockTable }) {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [page] = useState(1)
  const gridRef = useRef<HTMLDivElement>(null)

  const totalPages = Math.ceil(table.rows.length / 100)
  const pageRows = table.rows.slice((page - 1) * 100, page * 100)

  const toggleRow = (idx: number) => {
    setSelectedRows((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  const toggleAll = () => {
    if (selectedRows.size === pageRows.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(pageRows.map((_, i) => i)))
    }
  }

  const allSelected = selectedRows.size === pageRows.length && pageRows.length > 0
  const someSelected = selectedRows.size > 0 && !allSelected

  return (
    <div className="flex flex-col h-full w-full">
      {/* Toolbar */}
      <div className="flex min-h-[46px] items-center justify-between bg-dash-sidebar px-1.5 py-1.5 gap-2 overflow-x-auto border-b border-default flex-shrink-0">
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <Button type="default" size="tiny" icon={<Filter size={14} strokeWidth={1.5} />}>
            Filter
          </Button>
          <Button type="default" size="tiny" icon={<ListFilter size={14} strokeWidth={1.5} />}>
            Sort
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button type="primary" size="tiny" icon={<ChevronDown size={14} strokeWidth={1.5} />}>
            Insert
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div ref={gridRef} className="flex-1 overflow-auto min-h-0">
        <table className="w-full border-collapse text-sm mt-0" style={{ minWidth: '100%' }}>
          {/* Column Headers */}
          <thead className="sticky top-0 z-10">
            <tr className="bg-surface-200">
              {/* Select All Checkbox */}
              <th
                className="bg-surface-200 border-b border-default border-r border-r-secondary sticky left-0 z-20 w-[65px] min-w-[65px] max-w-[65px] px-3"
                style={{ height: 'var(--header-row-height, 35px)' }}
              >
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected
                    }}
                    onChange={toggleAll}
                    className="h-4 w-4 cursor-pointer rounded border border-strong bg-control text-foreground appearance-none checked:bg-foreground checked:border-foreground"
                    style={
                      allSelected || someSelected
                        ? {
                            backgroundImage: allSelected
                              ? "url(\"data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e\")"
                              : "url(\"data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3crect x='3' y='7' width='10' height='2' rx='1'/%3e%3c/svg%3e\")",
                            backgroundSize: '100% 100%',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                          }
                        : undefined
                    }
                  />
                </div>
              </th>
              {/* Data Columns */}
              {table.columns.map((col, ci) => (
                <th
                  key={col.name}
                  className={cn(
                    'bg-surface-200 border-b border-default text-left select-none whitespace-nowrap',
                    ci < table.columns.length - 1 && 'border-r border-r-secondary'
                  )}
                  style={{
                    height: 'var(--header-row-height, 35px)',
                    minWidth: col.type === 'uuid' ? 280 : col.type === 'timestamptz' ? 260 : 200,
                    maxWidth: col.type === 'uuid' ? 280 : undefined,
                  }}
                >
                  <div className="flex items-center gap-2 px-3 h-full">
                    {col.isPrimary && (
                      <Key
                        size={14}
                        strokeWidth={1.5}
                        className="text-foreground-light rotate-45 flex-shrink-0"
                      />
                    )}
                    <span className="text-xs text-foreground select-text overflow-hidden text-ellipsis">
                      {col.name}
                    </span>
                    <span className="text-xs font-normal text-foreground-light overflow-hidden text-ellipsis">
                      {col.type}
                    </span>
                  </div>
                </th>
              ))}
              {/* Add Column */}
              <th
                className="bg-surface-200 border-b border-default w-[100px] min-w-[100px]"
                style={{ height: 'var(--header-row-height, 35px)' }}
              >
                <div className="flex items-center justify-center">
                  <Plus size={14} strokeWidth={1.5} className="text-foreground-light" />
                </div>
              </th>
            </tr>
          </thead>
          {/* Data Rows */}
          <tbody>
            {pageRows.map((row, rowIdx) => {
              const isSelected = selectedRows.has(rowIdx)
              return (
                <tr
                  key={rowIdx}
                  className={cn(
                    'group transition-colors',
                    isSelected ? 'bg-surface-200' : 'bg-dash-sidebar hover:bg-surface-200'
                  )}
                >
                  {/* Row Checkbox */}
                  <td
                    className={cn(
                      'border-b border-secondary border-r border-r-secondary sticky left-0 z-10 w-[65px] min-w-[65px] max-w-[65px] px-3',
                      isSelected ? 'bg-surface-200' : 'bg-dash-sidebar group-hover:bg-surface-200'
                    )}
                    style={{ height: 35 }}
                  >
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleRow(rowIdx)}
                        className="h-4 w-4 cursor-pointer rounded border border-strong bg-control text-foreground appearance-none checked:bg-foreground checked:border-foreground"
                        style={
                          isSelected
                            ? {
                                backgroundImage:
                                  "url(\"data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e\")",
                                backgroundSize: '100% 100%',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat',
                              }
                            : undefined
                        }
                      />
                    </div>
                  </td>
                  {/* Data Cells */}
                  {table.columns.map((col, ci) => {
                    const val = row[col.name]
                    return (
                      <td
                        key={col.name}
                        className={cn(
                          'border-b border-secondary whitespace-nowrap overflow-hidden text-ellipsis text-sm px-3',
                          ci < table.columns.length - 1 && 'border-r border-r-secondary'
                        )}
                        style={{
                          height: 35,
                          maxWidth: col.type === 'uuid' ? 280 : col.type === 'text' ? 280 : 260,
                        }}
                      >
                        {val === null ? (
                          <span className="text-foreground-lighter opacity-50">NULL</span>
                        ) : (
                          <span className="text-foreground">{val}</span>
                        )}
                      </td>
                    )
                  })}
                  {/* Empty add-column cell */}
                  <td
                    className="border-b border-secondary w-[100px] min-w-[100px]"
                    style={{ height: 35 }}
                  />
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Footer / Pagination */}
      <div className="flex min-h-9 h-9 overflow-hidden overflow-x-auto items-center px-2 w-full border-t border-default flex-shrink-0 text-xs">
        <div className="flex items-center gap-x-4">
          <div className="flex items-center gap-x-1">
            <button
              className="p-1 text-foreground-light hover:text-foreground disabled:opacity-50"
              disabled
            >
              <ArrowLeft size={14} strokeWidth={1.5} />
            </button>
            <span className="text-foreground-light">Page</span>
            <input
              type="text"
              value={page}
              readOnly
              className="w-8 h-6 text-center text-xs border border-default rounded bg-control text-foreground"
            />
            <span className="text-foreground-light">of {totalPages}</span>
            <button
              className="p-1 text-foreground-light hover:text-foreground disabled:opacity-50"
              disabled={page >= totalPages}
            >
              <ArrowRight size={14} strokeWidth={1.5} />
            </button>
          </div>
          <Button
            type="default"
            size="tiny"
            iconRight={<ChevronDown size={10} strokeWidth={1.5} />}
          >
            100 rows
          </Button>
          <span className="text-foreground-light">{table.rows.length} records</span>
        </div>
      </div>
    </div>
  )
}

// ─── Table Editor Screen ────────────────────────────────────────────────

export function TableEditorScreen() {
  const [selectedTableId, setSelectedTableId] = useState<number | null>(SUBMISSIONS_TABLE.id)
  const [searchText, setSearchText] = useState('')

  const selectedTable = ALL_TABLES.find((t) => t.id === selectedTableId) ?? null

  const filteredTables = ALL_TABLES.filter((t) =>
    t.name.toLowerCase().includes(searchText.toLowerCase())
  )

  return (
    <div className="flex h-full w-full">
      {/* Product Menu / Sub-navbar */}
      <div
        className={cn(
          'flex flex-col h-full',
          'hide-scrollbar bg-dash-sidebar border-default border-r',
          'w-64 min-w-64 max-w-64'
        )}
      >
        {/* Title */}
        <div className="border-default flex min-h-[46px] items-center border-b px-6">
          <h4 className="text-lg">Table Editor</h4>
        </div>

        {/* Menu Content */}
        <div className="flex flex-col flex-grow gap-5 pt-5 h-full">
          {/* Schema Selector + New Table */}
          <div className="flex flex-col gap-y-1.5">
            <div className="mx-4">
              <Button
                size="tiny"
                type="default"
                className="w-full [&>span]:w-full !pr-1 space-x-1 justify-start"
                iconRight={
                  <ChevronsUpDown className="text-foreground-muted" strokeWidth={2} size={14} />
                }
              >
                <div className="w-full flex gap-1">
                  <p className="text-foreground-lighter">schema</p>
                  <p className="text-foreground">public</p>
                </div>
              </Button>
            </div>
            <div className="grid gap-3 mx-4">
              <Button
                block
                size="tiny"
                type="default"
                className="justify-start"
                icon={<Plus size={14} strokeWidth={1.5} className="text-foreground-muted" />}
              >
                New table
              </Button>
            </div>
          </div>

          {/* Search + Sort */}
          <div className="grow min-h-0 flex flex-col gap-2 pb-4">
            <div className="flex px-2 gap-2 items-center mx-2">
              <label htmlFor="search-tables" className="relative w-full">
                <input
                  id="search-tables"
                  type="text"
                  className="h-[28px] text-xs pl-7 pr-7 w-full rounded border border-default bg-control text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-1 focus:ring-foreground-muted"
                  value={searchText}
                  placeholder="Search tables..."
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
                />
                <Search
                  className="absolute left-2 top-0 bottom-0 my-auto text-foreground-muted"
                  size={14}
                  strokeWidth={1.5}
                />
                <button className="absolute right-1 top-[.3rem] text-foreground transition-colors hover:text-foreground">
                  <ChevronsDown size={18} strokeWidth={1} />
                </button>
              </label>
            </div>

            {/* Table List */}
            <div className="flex flex-1 min-h-0 w-full overflow-y-auto">
              <div className="w-full">
                {filteredTables.map((table) => {
                  const isActive = selectedTableId === table.id
                  return (
                    <button
                      key={table.id}
                      onClick={() => setSelectedTableId(table.id)}
                      className={cn(
                        'group relative w-full transition-colors h-[28px] flex items-center gap-3 text-sm cursor-pointer select-none',
                        'text-foreground-light hover:bg-control',
                        'pl-4 pr-1',
                        isActive && 'text-foreground !bg-selection'
                      )}
                    >
                      {isActive && <div className="absolute left-0 h-full w-0.5 bg-foreground" />}
                      <Table2
                        size={15}
                        strokeWidth={1.5}
                        className={cn(
                          'text-foreground-muted group-hover:text-foreground-lighter transition-colors flex-shrink-0',
                          isActive && 'text-foreground-light'
                        )}
                      />
                      <div className="truncate overflow-hidden text-ellipsis whitespace-nowrap flex items-center gap-2 relative w-full">
                        <span
                          className={cn(
                            'text-sm transition truncate',
                            isActive
                              ? 'text-foreground'
                              : 'text-foreground-light group-hover:text-foreground'
                          )}
                        >
                          {table.name}
                        </span>
                        {table.hasRls && (
                          <Globe
                            size={14}
                            strokeWidth={1.5}
                            className="text-foreground-muted flex-shrink-0"
                          />
                        )}
                      </div>
                      <div
                        className={cn(
                          'text-foreground-lighter transition-all',
                          'text-transparent group-hover:text-foreground',
                          isActive && 'text-foreground'
                        )}
                      >
                        <MoreVertical size={14} strokeWidth={2} />
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Data Grid */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {selectedTable ? (
          <MockDataGrid table={selectedTable} />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-surface-100">
            <p className="text-foreground-lighter text-sm">Select a table to view its data</p>
          </div>
        )}
      </div>
    </div>
  )
}

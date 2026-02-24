import { useMemo, useState } from 'react'
import { Tabs_Shadcn_, TabsList_Shadcn_, TabsTrigger_Shadcn_ } from 'ui'
import { GenericSkeletonLoader } from 'ui-patterns/ShimmeringLoader'
import TwoOptionToggle from 'components/ui/TwoOptionToggle'

import type { QueryPerformanceRow } from '../../QueryPerformance/QueryPerformance.types'
import { useQueryInsightsIssues } from '../hooks/useQueryInsightsIssues'
import type { Mode, IssueFilter } from './QueryInsightsTable.types'
import { getQueryType } from './QueryInsightsTable.utils'
import { QueryInsightsTableRow } from './QueryInsightsTableRow'

interface QueryInsightsTableProps {
  data: QueryPerformanceRow[]
  isLoading: boolean
}

export const QueryInsightsTable = ({ data, isLoading }: QueryInsightsTableProps) => {
  const { classified, errors, indexIssues, slowQueries } = useQueryInsightsIssues(data)
  const [mode, setMode] = useState<Mode>('triage')
  const [filter, setFilter] = useState<IssueFilter>('all')
  const triageItems = useMemo(() => classified.filter((q) => q.issueType !== null), [classified])

  const filteredTriageItems = useMemo(
    () => {
      const filtered = filter === 'all' ? triageItems : triageItems.filter((q) => q.issueType === filter)
      return filtered.map((item) => ({
        ...item,
        queryType: getQueryType(item.query),
      }))
    },
    [triageItems, filter]
  )
  console.log(filteredTriageItems)

  const explorerItems = useMemo(
    () => [...classified].sort((a, b) => b.calls - a.calls),
    [classified]
  )

  const errorCount = errors.length
  const indexCount = indexIssues.length
  const slowCount = slowQueries.length

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between px-6 border-b flex-shrink-0 h-10">
        <div className="flex items-center">
          {mode === 'triage' ? (
            <Tabs_Shadcn_ value={filter} onValueChange={(v) => setFilter(v as IssueFilter)}>
              <TabsList_Shadcn_ className="flex gap-x-4 rounded-none !mt-0 pt-0 !border-none">
                <TabsTrigger_Shadcn_
                  value="all"
                  className="text-xs py-3 border-b-[1px] font-mono uppercase"
                >
                  All{triageItems.length > 0 && ` (${triageItems.length})`}
                </TabsTrigger_Shadcn_>
                <TabsTrigger_Shadcn_
                  value="error"
                  className="text-xs py-3 border-b-[1px] font-mono uppercase"
                >
                  Errors{errorCount > 0 && ` (${errorCount})`}
                </TabsTrigger_Shadcn_>
                <TabsTrigger_Shadcn_
                  value="index"
                  className="text-xs py-3 border-b-[1px] font-mono uppercase"
                >
                  Index{indexCount > 0 && ` (${indexCount})`}
                </TabsTrigger_Shadcn_>
                <TabsTrigger_Shadcn_
                  value="slow"
                  className="text-xs py-3 border-b-[1px] font-mono uppercase"
                >
                  Slow{slowCount > 0 && ` (${slowCount})`}
                </TabsTrigger_Shadcn_>
              </TabsList_Shadcn_>
            </Tabs_Shadcn_>
          ) : (
            <span className="text-xs font-mono uppercase text-foreground-lighter py-3">
              All Queries
            </span>
          )}
        </div>

        <TwoOptionToggle
          width={75}
          options={['explorer', 'triage']}
          activeOption={mode}
          borderOverride="border"
          onClickOption={setMode}
        />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {isLoading ? (
          <div className="px-6 py-4">
            <GenericSkeletonLoader />
          </div>
        ) : mode === 'triage' ? (
          <div className="flex flex-col">
            {filteredTriageItems.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-foreground-lighter">
                  {data.length === 0
                    ? 'No query data available yet'
                    : 'No issues found!'}
                </p>
              </div>
            ) : (
              <>
                {filteredTriageItems.map((item, idx) => (
                  <QueryInsightsTableRow
                    key={idx}
                    item={item}
                    type="triage"
                  />
                ))}

                {/* Footer message */}
                <div className="py-8 text-center">
                  <p className="text-sm text-foreground-lighter">
                    Resolve all issues to reach a perfect score!
                  </p>
                </div>
              </>
            )}
          </div>
        ) : (
          /* ── Explorer View ── */
          <div className="flex flex-col">
            {/* Column headers */}
            <div className="flex items-center px-6 py-2 border-b text-xs font-mono uppercase text-foreground-light">
              <div className="flex-1">Query</div>
              <div className="w-24 text-right">Calls ↓</div>
              <div className="w-24 text-right">Mean</div>
              <div className="w-36 text-right">App</div>
              <div className="w-28 text-right">Status</div>
              <div className="w-24 text-right">Actions</div>
            </div>

            {explorerItems.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-foreground-lighter">No query data available yet</p>
              </div>
            ) : (
              explorerItems.map((item, idx) => (
                <QueryInsightsTableRow
                  key={idx}
                  item={item}
                  type="explorer"
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

import { useState, useCallback, useEffect } from 'react'
import {
  PluginElementRenderProps,
  useYooptaEditor,
  Elements,
  useYooptaReadOnly,
} from '@yoopta/editor'
import { Play, ChevronDown, ChevronUp, Table2, BarChart3, Loader2, Pencil } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { useParams } from 'common'
import { executeSql } from 'data/sql/execute-sql-query'
import { useDatabaseSelectorStateSnapshot } from 'state/database-selector'
import Results from 'components/interfaces/SQLEditor/UtilityPanel/Results'
import { Button, cn, Input_Shadcn_ } from 'ui'
import { BlockViewConfiguration } from 'components/ui/QueryBlock/BlockViewConfiguration'
import { DEFAULT_CHART_CONFIG, type ChartConfig } from 'components/ui/QueryBlock/QueryBlock.types'
import { SQLQueryChart } from './SQLQueryChart'

export interface SQLQueryElementProps {
  sql: string
  label: string
  chartConfig: ChartConfig
  results?: any[]
  error?: string
}

export const SQLQueryElement = ({
  element,
  children,
  attributes,
  blockId,
}: PluginElementRenderProps) => {
  const editor = useYooptaEditor()
  const isReadOnly = useYooptaReadOnly()
  const { ref: projectRef } = useParams()
  const state = useDatabaseSelectorStateSnapshot()

  const props = element.props as SQLQueryElementProps
  const { sql = '', label = 'Untitled Query', chartConfig = DEFAULT_CHART_CONFIG } = props

  const [localSql, setLocalSql] = useState(sql)
  const [localLabel, setLocalLabel] = useState(label)
  const [localChartConfig, setLocalChartConfig] = useState<ChartConfig>(chartConfig)
  const [showSql, setShowSql] = useState(true)
  const [isEditingLabel, setIsEditingLabel] = useState(false)
  const [results, setResults] = useState<any[] | undefined>(props.results)
  const [error, setError] = useState<string | undefined>(props.error)

  // Sync local state with element props
  useEffect(() => {
    setLocalSql(sql)
    setLocalLabel(label)
    setLocalChartConfig(chartConfig)
    setResults(props.results)
    setError(props.error)
  }, [sql, label, chartConfig, props.results, props.error])

  const { mutate: executeQuery, isPending: isExecuting } = useMutation({
    mutationFn: async (query: string) => {
      const result = await executeSql({
        projectRef: projectRef!,
        connectionString: state.selectedDatabaseId,
        sql: query,
      })
      return result
    },
    onSuccess: (data) => {
      const resultRows = Array.isArray(data.result) ? data.result : []
      setResults(resultRows)
      setError(undefined)

      // Update element with results
      Elements.updateElement(editor, blockId, {
        type: 'sql-query',
        props: {
          ...props,
          sql: localSql,
          label: localLabel,
          results: resultRows,
          error: undefined,
        },
      })
    },
    onError: (err: any) => {
      const errorMessage = err?.message || 'An error occurred while executing the query'
      setError(errorMessage)
      setResults(undefined)

      // Update element with error
      Elements.updateElement(editor, blockId, {
        type: 'sql-query',
        props: {
          ...props,
          sql: localSql,
          label: localLabel,
          results: undefined,
          error: errorMessage,
        },
      })
    },
  })

  const handleRunQuery = useCallback(() => {
    if (!localSql.trim() || !projectRef) return
    executeQuery(localSql)
  }, [localSql, projectRef, executeQuery])

  const handleSqlChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newSql = e.target.value
      setLocalSql(newSql)

      // Debounced update to element
      Elements.updateElement(editor, blockId, {
        type: 'sql-query',
        props: {
          ...props,
          sql: newSql,
        },
      })
    },
    [editor, blockId, props]
  )

  const handleLabelChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newLabel = e.target.value
    setLocalLabel(newLabel)
  }, [])

  const handleLabelBlur = useCallback(() => {
    setIsEditingLabel(false)
    Elements.updateElement(editor, blockId, {
      type: 'sql-query',
      props: {
        ...props,
        label: localLabel,
      },
    })
  }, [editor, blockId, props, localLabel])

  const handleChartConfigChange = useCallback(
    (config: Partial<ChartConfig>) => {
      const newConfig = { ...localChartConfig, ...config }
      setLocalChartConfig(newConfig)

      Elements.updateElement(editor, blockId, {
        type: 'sql-query',
        props: {
          ...props,
          chartConfig: newConfig,
        },
      })
    },
    [editor, blockId, props, localChartConfig]
  )

  const hasResults = Array.isArray(results) && results.length > 0
  const view = localChartConfig.view || 'table'

  return (
    <div
      {...attributes}
      contentEditable={false}
      className="yoopta-sql-query my-4 rounded-md border border-default bg-surface-100 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-default bg-surface-200">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isEditingLabel && !isReadOnly ? (
            <Input_Shadcn_
              value={localLabel}
              onChange={handleLabelChange}
              onBlur={handleLabelBlur}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleLabelBlur()
                }
              }}
              className="h-6 text-sm font-medium max-w-[200px]"
              autoFocus
            />
          ) : (
            <button
              onClick={() => !isReadOnly && setIsEditingLabel(true)}
              className={cn(
                'text-sm font-medium text-foreground truncate',
                !isReadOnly && 'hover:text-foreground-light cursor-pointer'
              )}
            >
              {localLabel}
            </button>
          )}
          {!isReadOnly && !isEditingLabel && (
            <button
              onClick={() => setIsEditingLabel(true)}
              className="text-foreground-lighter hover:text-foreground transition-colors"
            >
              <Pencil size={12} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            type="text"
            size="tiny"
            className="w-7 h-7"
            onClick={() => setShowSql(!showSql)}
            icon={showSql ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          />

          {hasResults && (
            <BlockViewConfiguration
              view={view}
              isChart={view === 'chart'}
              lockColumns={false}
              chartConfig={localChartConfig}
              columns={Object.keys(results?.[0] ?? {})}
              changeView={(nextView) => handleChartConfigChange({ view: nextView })}
              updateChartConfig={handleChartConfigChange}
            />
          )}

          {!isReadOnly && (
            <Button
              type="text"
              size="tiny"
              className="w-7 h-7"
              onClick={handleRunQuery}
              disabled={isExecuting || !localSql.trim()}
              icon={
                isExecuting ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />
              }
            />
          )}
        </div>
      </div>

      {/* SQL Editor */}
      {showSql && (
        <div className="border-b border-default">
          <textarea
            value={localSql}
            onChange={handleSqlChange}
            placeholder="SELECT * FROM your_table LIMIT 10"
            className={cn(
              'w-full min-h-[100px] p-3 font-mono text-sm bg-transparent resize-y',
              'focus:outline-none focus:ring-0 border-0',
              'text-foreground placeholder:text-foreground-muted'
            )}
            readOnly={isReadOnly}
            onKeyDown={(e) => {
              // Run query on Cmd/Ctrl + Enter
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault()
                handleRunQuery()
              }
            }}
          />
        </div>
      )}

      {/* Loading State */}
      {isExecuting && (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={24} className="animate-spin text-foreground-muted" />
          <span className="ml-2 text-sm text-foreground-muted">Executing query...</span>
        </div>
      )}

      {/* Error State */}
      {!isExecuting && error && (
        <div className="p-3 bg-destructive-200">
          <p className="text-sm text-destructive font-mono">ERROR: {error}</p>
        </div>
      )}

      {/* Results */}
      {!isExecuting && !error && results !== undefined && (
        <>
          {results.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-foreground-light">No results returned from query</p>
            </div>
          ) : view === 'chart' ? (
            <SQLQueryChart results={results} chartConfig={localChartConfig} />
          ) : (
            <div className="max-h-64 overflow-auto">
              <Results rows={results} />
            </div>
          )}
        </>
      )}

      {/* Hidden children for Slate */}
      <div className="hidden">{children}</div>
    </div>
  )
}

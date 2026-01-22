import { YooptaPlugin, generateId } from '@yoopta/editor'
import { SQLQueryElement, type SQLQueryElementProps } from './SQLQueryElement'
import { DEFAULT_CHART_CONFIG } from 'components/ui/QueryBlock/QueryBlock.types'

const SQLQueryPlugin = new YooptaPlugin({
  type: 'SQLQuery',
  elements: {
    'sql-query': {
      render: SQLQueryElement,
      props: {
        sql: '',
        label: 'Untitled Query',
        chartConfig: DEFAULT_CHART_CONFIG,
        nodeType: 'void',
      },
    },
  },
  options: {
    display: {
      title: 'SQL Query',
      description: 'Execute SQL queries and visualize results',
    },
    shortcuts: ['sql', 'query', 'select'],
  },
  parsers: {
    html: {
      deserialize: {
        nodeNames: ['DIV'],
        parse: (el) => {
          if (el.getAttribute('data-type') === 'sql-query') {
            return {
              id: generateId(),
              type: 'sql-query',
              children: [{ text: '' }],
              props: {
                sql: el.getAttribute('data-sql') || '',
                label: el.getAttribute('data-label') || 'Untitled Query',
                chartConfig: DEFAULT_CHART_CONFIG,
              },
            }
          }
          return undefined
        },
      },
      serialize: (element) => {
        const props = element.props as SQLQueryElementProps
        return `<div data-type="sql-query" data-sql="${props.sql}" data-label="${props.label}">
          <pre><code class="language-sql">${props.sql}</code></pre>
        </div>`
      },
    },
    markdown: {
      serialize: (element) => {
        const props = element.props as SQLQueryElementProps
        return `\`\`\`sql\n${props.sql}\n\`\`\`\n`
      },
    },
  },
})

export { SQLQueryPlugin }

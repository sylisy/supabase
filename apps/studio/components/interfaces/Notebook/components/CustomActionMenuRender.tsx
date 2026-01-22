import { ActionMenuRenderProps } from '@yoopta/action-menu-list'
import { cn } from 'ui'
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Minus,
  Database,
} from 'lucide-react'

// Map plugin types to icons
const PLUGIN_ICONS: Record<string, React.ReactNode> = {
  Paragraph: <Type size={18} />,
  HeadingOne: <Heading1 size={18} />,
  HeadingTwo: <Heading2 size={18} />,
  HeadingThree: <Heading3 size={18} />,
  BulletedList: <List size={18} />,
  NumberedList: <ListOrdered size={18} />,
  Divider: <Minus size={18} />,
  SQLQuery: <Database size={18} />,
}

export function CustomActionMenuRender({
  actions,
  getItemProps,
  getRootProps,
  empty,
}: ActionMenuRenderProps) {
  if (empty) {
    return (
      <div
        {...getRootProps()}
        className="z-50 min-w-[200px] overflow-hidden rounded-md border border-default bg-overlay shadow-lg"
      >
        <div className="px-3 py-2 text-sm text-foreground-light">No results found</div>
      </div>
    )
  }

  return (
    <div
      {...getRootProps()}
      className="z-50 min-w-[220px] max-h-[300px] overflow-y-auto rounded-md border border-default bg-overlay shadow-lg"
    >
      <div className="p-1">
        {actions.map((action) => {
          const itemProps = getItemProps(action.type)
          const isSelected = itemProps['data-action-menu-item-selected'] === true

          return (
            <button
              key={action.type}
              {...itemProps}
              className={cn(
                'flex w-full items-center gap-3 rounded-sm px-2 py-1.5 text-left text-sm transition-colors',
                'hover:bg-surface-200 focus:bg-surface-200 focus:outline-none',
                isSelected && 'bg-surface-200'
              )}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-default bg-surface-100 text-foreground-light">
                {PLUGIN_ICONS[action.type] || action.icon}
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-foreground">{action.title}</span>
                {action.description && (
                  <span className="text-xs text-foreground-lighter">{action.description}</span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

import { ToolbarRenderProps } from '@yoopta/toolbar'
import { Bold, Italic, Underline, Strikethrough, Code, Highlighter } from 'lucide-react'
import { cn } from 'ui'

const MARK_ICONS: Record<string, React.ReactNode> = {
  bold: <Bold size={16} />,
  italic: <Italic size={16} />,
  underline: <Underline size={16} />,
  strike: <Strikethrough size={16} />,
  code: <Code size={16} />,
  highlight: <Highlighter size={16} />,
}

const MARKS = ['bold', 'italic', 'underline', 'strike', 'code', 'highlight'] as const

export function CustomToolbarRender({ editor }: ToolbarRenderProps) {
  const handleMarkClick = (mark: string) => {
    editor.formats[mark]?.toggle()
  }

  const isMarkActive = (mark: string) => {
    return editor.formats[mark]?.isActive()
  }

  return (
    <div className="z-50 flex items-center gap-0.5 rounded-md border border-default bg-overlay p-1 shadow-lg">
      {MARKS.map((mark) => (
        <button
          key={mark}
          onClick={() => handleMarkClick(mark)}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-sm transition-colors',
            'hover:bg-surface-200 focus:outline-none',
            isMarkActive(mark) && 'bg-surface-300 text-foreground'
          )}
          title={mark.charAt(0).toUpperCase() + mark.slice(1)}
        >
          {MARK_ICONS[mark]}
        </button>
      ))}
    </div>
  )
}

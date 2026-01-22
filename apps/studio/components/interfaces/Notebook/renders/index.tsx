import { PluginElementRenderProps } from '@yoopta/editor'
import { cn } from 'ui'

// Paragraph render
export function ParagraphRender({ attributes, children, element }: PluginElementRenderProps) {
  return (
    <p {...attributes} className={cn('text-base leading-relaxed text-foreground', 'mb-1')}>
      {children}
    </p>
  )
}

// Heading One render
export function HeadingOneRender({ attributes, children, element }: PluginElementRenderProps) {
  return (
    <h1
      {...attributes}
      className={cn('text-3xl font-bold leading-tight text-foreground', 'mt-6 mb-2')}
    >
      {children}
    </h1>
  )
}

// Heading Two render
export function HeadingTwoRender({ attributes, children, element }: PluginElementRenderProps) {
  return (
    <h2
      {...attributes}
      className={cn('text-2xl font-semibold leading-tight text-foreground', 'mt-5 mb-2')}
    >
      {children}
    </h2>
  )
}

// Heading Three render
export function HeadingThreeRender({ attributes, children, element }: PluginElementRenderProps) {
  return (
    <h3
      {...attributes}
      className={cn('text-xl font-semibold leading-snug text-foreground', 'mt-4 mb-2')}
    >
      {children}
    </h3>
  )
}

// Bulleted List render
export function BulletedListRender({ attributes, children, element }: PluginElementRenderProps) {
  return (
    <ul {...attributes} className={cn('list-disc pl-6 text-foreground', 'mb-2')}>
      {children}
    </ul>
  )
}

// Numbered List render
export function NumberedListRender({ attributes, children, element }: PluginElementRenderProps) {
  return (
    <ol {...attributes} className={cn('list-decimal pl-6 text-foreground', 'mb-2')}>
      {children}
    </ol>
  )
}

// Divider render
export function DividerRender({ attributes, children, element }: PluginElementRenderProps) {
  return (
    <div {...attributes} contentEditable={false} className="py-4">
      <hr className="border-t border-border-default" />
      {children}
    </div>
  )
}

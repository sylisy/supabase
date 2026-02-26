/**
 * Transforms MDX-specific JSX into plain Markdown suitable for LLMs and
 * copy-as-markdown tooling.
 */

const ADMONITION_TYPE_MAP: Record<string, string> = {
  note: 'NOTE',
  tip: 'TIP',
  info: 'NOTE',
  caution: 'CAUTION',
  warning: 'WARNING',
  danger: 'WARNING',
  deprecation: 'WARNING',
}

/** Strip {/* ... *\/} MDX expression comments */
function stripMdxComments(content: string): string {
  return content.replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
}

/**
 * <Admonition type="note" title="Optional title">
 *   body
 * </Admonition>
 *
 * → GitHub-style blockquote admonition:
 *
 * > [!NOTE]
 * > **Optional title**
 * >
 * > body
 */
function transformAdmonitions(content: string): string {
  return content.replace(
    /<Admonition\b([^>]*)>([\s\S]*?)<\/Admonition>/g,
    (_, attrs: string, body: string) => {
      const typeMatch = attrs.match(/type="(\w+)"/)
      const titleMatch = attrs.match(/title="([^"]*)"/)
      const type = typeMatch?.[1] ?? 'note'
      const ghType = ADMONITION_TYPE_MAP[type] ?? 'NOTE'
      const title = titleMatch?.[1]

      const bodyLines = body
        .trim()
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n')

      const header = title
        ? `> [!${ghType}]\n> **${title}**\n>\n${bodyLines}`
        : `> [!${ghType}]\n${bodyLines}`

      return header
    }
  )
}

function extractAttr(attrs: string, name: string): string | undefined {
  const match = attrs.match(new RegExp(`\\b${name}="([^"]*)"`, ''))
  return match?.[1]
}

function extractSrc(attrs: string): string | undefined {
  // Simple string: src="/path/to/img.png"
  const simple = attrs.match(/\bsrc="([^"]+)"/)
  if (simple) return simple[1]

  // Object literal: src={{ light: '/...', dark: '/...' }} — prefer light
  const light = attrs.match(/light:\s*['"]([^'"]+)['"]/)
  if (light) return light[1]

  const dark = attrs.match(/dark:\s*['"]([^'"]+)['"]/)
  if (dark) return dark[1]

  return undefined
}

/**
 * <Image alt="..." src="/path" caption="..." />
 * <Image alt="..." src={{ light: '/...', dark: '/...' }} />
 *
 * → ![alt](src "caption")
 */
function transformImages(content: string): string {
  return content.replace(/<Image\b([\s\S]*?)\/>/g, (_, attrs: string) => {
    const alt = extractAttr(attrs, 'alt') ?? ''
    const src = extractSrc(attrs)
    const caption = extractAttr(attrs, 'caption')

    if (!src) return ''
    return caption ? `![${alt}](${src} "${caption}")` : `![${alt}](${src})`
  })
}

/**
 * For any remaining JSX block-level components (e.g. <Tabs>, <TabPanel>,
 * <StepHikeCompact>), strip the opening and closing tags but keep the inner
 * text content so prose is not lost.
 *
 * Self-closing tags with no useful text content are removed entirely.
 */
function stripRemainingJsx(content: string): string {
  // Remove self-closing tags that don't carry text (e.g. <IconCheck />)
  content = content.replace(/<[A-Z][A-Za-z.]*\b[^>]*\/>/g, '')
  // Strip opening and closing tags, keeping inner content
  content = content.replace(/<\/?[A-Z][A-Za-z.]*\b[^>]*>/g, '')
  return content
}

/** Collapse runs of 3+ blank lines down to two (one blank line between blocks) */
function normalizeBlankLines(content: string): string {
  return content.replace(/\n{3,}/g, '\n\n')
}

export function mdxToMarkdown(content: string): string {
  content = stripMdxComments(content)
  content = transformAdmonitions(content)
  content = transformImages(content)
  content = stripRemainingJsx(content)
  content = normalizeBlankLines(content)
  return content.trim()
}

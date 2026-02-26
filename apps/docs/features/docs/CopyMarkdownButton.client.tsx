'use client'

import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

import { cn } from 'ui'

type CopyState = 'idle' | 'fetching' | 'copied' | 'error'

interface CopyMarkdownButtonProps {
  /**
   * The URL that serves the raw Markdown for this page.
   * Constructed by the server as `${BASE_PATH}${pathname}.mdx`.
   * Kept as a prop so the server component controls the URL and the
   * client component stays a pure, testable function of its inputs.
   */
  markdownUrl: string
}

/**
 * Fetches a page's Markdown from `markdownUrl` and copies it to the
 * clipboard. The URL is the `.mdx` variant of the current guide page,
 * so the button and the URL feature share exactly one code path.
 */
export function CopyMarkdownButton({ markdownUrl }: CopyMarkdownButtonProps) {
  const [state, setState] = useState<CopyState>('idle')

  async function handleCopy() {
    if (state === 'fetching') return

    setState('fetching')

    try {
      const res = await fetch(markdownUrl)
      if (!res.ok) throw new Error(`Unexpected status ${res.status}`)

      const text = await res.text()
      await navigator.clipboard.writeText(text)

      setState('copied')
      setTimeout(() => setState('idle'), 2000)
    } catch {
      setState('error')
      setTimeout(() => setState('idle'), 2000)
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={state === 'fetching'}
      aria-label="Copy page as markdown"
      className={cn(
        'flex items-center gap-1.5',
        'text-sm text-scale-1000 hover:text-scale-1200',
        'transition-colors',
        'disabled:opacity-50 disabled:cursor-wait'
      )}
    >
      {state === 'copied' ? (
        <>
          <Check size={14} strokeWidth={1.5} />
          Copied!
        </>
      ) : state === 'error' ? (
        <>
          <Copy size={14} strokeWidth={1.5} />
          Failed to copy
        </>
      ) : (
        <>
          <Copy size={14} strokeWidth={1.5} />
          Copy page
        </>
      )}
    </button>
  )
}

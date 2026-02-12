'use client'

import { useState } from 'react'
import { Badge, Card, CardContent, CardFooter, CardHeader, cn } from 'ui'
import { ChevronDown, ExternalLink } from 'lucide-react'
import type {
  SimilarSolvedThread,
  SimilarThreadFeedbackSubmission,
  SimilarThreadFeedbackResult,
} from '~/types/contribute'

/**
 * Placeholder -- will be replaced with a real API call that inserts into
 * the similar_thread_feedback table
 * (parent_thread_id, similar_thread_key, reaction, feedback, created_at).
 */
export const submitSimilarThreadFeedback = async (
  submission: SimilarThreadFeedbackSubmission
): Promise<SimilarThreadFeedbackResult> => {
  console.log('[SimilarThreadFeedback] submitting:', {
    ...submission,
    created_at: new Date().toISOString(),
  })
  await new Promise((resolve) => setTimeout(resolve, 800))
  return { success: true }
}

interface SimilarSolvedThreadsProps {
  threads: SimilarSolvedThread[]
}

const SimilarThreadCard = ({
  thread,
  className,
}: {
  thread: SimilarSolvedThread
  className?: string
}) => {
  return (
    <div className={cn('border-b border-border px-6 py-6 flex flex-col gap-3', className)}>
      <div className="flex items-start justify-between gap-4">
        <span className="text-base text-foreground leading-snug">{thread.subject}</span>
        {thread.external_activity_url && (
          <a
            href={thread.external_activity_url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-1.5 text-sm text-brand-link hover:underline transition-colors"
          >
            View thread
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>

      {thread.problem_description && (
        <p className="text-sm text-foreground-lighter leading-relaxed">
          {thread.problem_description}
        </p>
      )}

      {thread.stack?.filter((s) => s !== 'Other').length > 0 && (
        <div className="flex flex-wrap gap-2">
          {thread.stack
            .filter((s) => s !== 'Other')
            .map((tech) => (
              <Badge key={tech} variant="default">
                {tech}
              </Badge>
            ))}
        </div>
      )}
    </div>
  )
}

export const SimilarSolvedThreads = ({ threads }: SimilarSolvedThreadsProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className={cn('relative')}>
      <CardHeader className={cn('p-0', !isExpanded && 'border-b-0')}>
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="flex w-full items-center gap-1.5 px-[var(--card-padding-x)] py-4 text-left text-xs font-mono uppercase text-card-foreground"
        >
          Related solved threads
          <span className="text-foreground-muted tabular-nums font-normal">({threads.length})</span>
          <ChevronDown
            className={`h-3.5 w-3.5 text-foreground-lighter transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'
              }`}
          />
        </button>
      </CardHeader>
      {isExpanded && (
        <>
          <CardContent className="p-0">
            {threads.map((thread, idx) => (
              <SimilarThreadCard
                key={thread.thread_key || idx}
                thread={thread}
                className={idx === threads.length - 1 ? 'border-b-0' : undefined}
              />
            ))}
          </CardContent>
          <CardFooter>
            <p className="text-xs text-foreground-muted">Collected from community discussions</p>
          </CardFooter>
        </>
      )}
    </Card>
  )
}

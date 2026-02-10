import Link from 'next/link'
import { Badge, Card, CardContent, cn } from 'ui'
import { Lightbulb, ExternalLink, Sparkles } from 'lucide-react'
import { getSimilarThreads } from '~/data/contribute'
import type { SimilarThread } from '~/types/contribute'
import { SimilarThreadsFeedback } from './SimilarThreadsFeedback'
import { DiscordIcon, GitHubIcon, RedditIcon } from './Icons'

function SourceIcon({ source, className }: { source: string; className?: string }) {
  switch (source) {
    case 'discord':
      return <DiscordIcon className={cn('h-4 w-4 text-[#5865F2]', className)} />
    case 'reddit':
      return <RedditIcon className={cn('h-4 w-4 text-[#FF4500]', className)} />
    case 'github':
      return <GitHubIcon className={cn('h-4 w-4 text-foreground', className)} />
    default:
      return null
  }
}

function SimilarThreadCard({
  thread,
  sourceThreadId,
}: {
  thread: SimilarThread
  sourceThreadId: string
}) {
  const hasSteps = thread.solution_steps && thread.solution_steps.length > 0

  return (
    <Card className="overflow-hidden transition-all hover:border-foreground-muted">
      <CardContent className="p-5">
        <div className="flex flex-col gap-4">
          {/* Header with source and match info */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <SourceIcon source={thread.source} />
              <Link
                href={`/contribute/t/${thread.thread_id}`}
                className="text-sm font-medium text-foreground hover:text-brand-600 transition-colors line-clamp-2"
              >
                {thread.subject}
              </Link>
            </div>
            {thread.external_activity_url && (
              <a
                href={thread.external_activity_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground-lighter hover:text-foreground transition-colors shrink-0"
                aria-label="View original thread"
              >
                <ExternalLink size={14} />
              </a>
            )}
          </div>

          {/* Summary */}
          {thread.summary && (
            <p className="text-sm text-foreground-light leading-relaxed">{thread.summary}</p>
          )}

          {/* Solution steps */}
          {hasSteps && (
            <div className="bg-surface-100 rounded-lg p-4 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb size={14} className="text-brand-600" />
                <span className="text-xs font-medium text-foreground-light uppercase tracking-wide">
                  Solution
                </span>
              </div>
              <ol className="space-y-2">
                {thread.solution_steps!.map((step, index) => (
                  <li key={index} className="flex gap-3 text-sm text-foreground-light">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-brand-400/10 text-brand-600 text-xs font-medium flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Footer with metadata and feedback */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              {thread.product_areas.slice(0, 2).map((area) => (
                <Badge key={area} variant="default" className="text-xs">
                  {area}
                </Badge>
              ))}
              {thread.match_reason && (
                <span className="text-xs text-foreground-lighter italic">{thread.match_reason}</span>
              )}
            </div>
            <SimilarThreadsFeedback
              sourceThreadId={sourceThreadId}
              similarThreadId={thread.thread_id}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface SimilarThreadsProps {
  threadId: string
}

export async function SimilarThreads({ threadId }: SimilarThreadsProps) {
  const similarThreads = await getSimilarThreads(threadId)

  if (!similarThreads || similarThreads.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Sparkles size={16} className="text-brand-600" />
        <h3 className="text-sm font-medium text-foreground">Similar solved threads</h3>
        <Badge variant="success" className="text-xs">
          AI
        </Badge>
      </div>
      <div className="grid gap-4">
        {similarThreads.map((thread) => (
          <SimilarThreadCard key={thread.thread_id} thread={thread} sourceThreadId={threadId} />
        ))}
      </div>
    </div>
  )
}

import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Badge, Card, CardContent, CardHeader, CardTitle } from 'ui'
import { getThreadRepliesById } from '~/data/contribute'
import type { ThreadRow } from '~/types/contribute'
import { HelpOnPlatformButton } from './HelpOnPlatformButton'
import { DiscordIcon, GitHubIcon, RedditIcon } from './Icons'
import { markdownComponents } from './markdownComponents'
import { RepliesList } from './RepliesList'
import { SimilarSolvedThreads } from './SimilarSolvedThreads'

export async function Conversation({ thread }: { thread: ThreadRow }) {
  const { question, replies } = await getThreadRepliesById(thread.thread_key)

  if (!question && replies.length === 0) {
    return null
  }

  const validReplies = replies.filter((reply: { content: string | null }) => reply.content)
  const productAreas = thread.product_areas.filter((a: string) => a !== 'Other')
  const stackItems = thread.stack.filter((t: string) => t !== 'Other')
  const hasMetadata = productAreas.length > 0 || stackItems.length > 0

  return (
    <div className="flex flex-col gap-10">
      {/* Title, Question, and First Reply Section */}
      {question && question.content && (
        <div className="bg-surface-200 py-4 px-[var(--card-padding-x)] rounded-lg border border-border flex flex-col gap-4">
          {/* Platform, Date, Title, Author, and Button */}
          <div className="pt-1 flex flex-col gap-3">
            {/* Platform, Date */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {thread.channel === 'discord' && <DiscordIcon className="h-4 w-4 text-[#5865F2]" />}
                {thread.channel === 'reddit' && <RedditIcon className="h-4 w-4 text-[#FF4500]" />}
                {thread.channel === 'github' && <GitHubIcon className="h-4 w-4 text-foreground" />}
                <p className="text-xs text-foreground-lighter">
                  {thread.channelDisplayName}{' '} · {' '}
                  {thread.posted}
                </p>
              </div>

            </div>

            <header className="flex flex-col gap-1">
              <h1 className="text-2xl font-medium text-foreground text-balance">{thread.title}</h1>
              <p className="text-xs text-foreground-lighter">
                by{' '}
                <Link
                  href={`/contribute/u/${encodeURIComponent(thread.user)}`}
                  className="hover:text-foreground transition-colors"
                >
                  {thread.user}
                </Link>
              </p>
            </header>

            <HelpOnPlatformButton
              type="default"
              channel={thread.channel}
              externalActivityUrl={thread.external_activity_url}
            />

          </div>



          {/* Question */}
          <div className="border border-border rounded-lg p-6 bg-surface-100 min-w-0 shadow-sm">
            <div className="text-foreground mb-4 min-w-0">
              <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
                {question.content}
              </ReactMarkdown>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {question.author && (
                <>
                  <Badge variant="success">OP</Badge>
                  <Link
                    href={`/contribute/u/${encodeURIComponent(question.author)}`}
                    className="font-medium hover:text-foreground transition-colors"
                  >
                    {question.author}
                  </Link>
                </>
              )}
              {question.author && question.ts && <span>·</span>}
              {question.ts && question.external_activity_url ? (
                <a
                  href={question.external_activity_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  {new Date(question.ts).toLocaleString()}
                </a>
              ) : (
                question.ts && <span>{new Date(question.ts).toLocaleString()}</span>
              )}
            </div>
          </div>

          {/* Product areas and stack */}
          {hasMetadata && (
            <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-8">
              {productAreas.length > 0 && (

                <div className="flex flex-wrap gap-2">
                  {productAreas.map((area: string) => (
                    <Badge key={area} variant="default">
                      {area}
                    </Badge>
                  ))}

                </div>
              )}
              {stackItems.length > 0 && (

                <div className="flex flex-wrap gap-2">
                  {stackItems.map((tech: string) => (
                    <Badge key={tech} variant="default">
                      {tech}
                    </Badge>
                  ))}
                </div>

              )}
            </div>
          )}
        </div>
      )
      }

      {/* Summary Section */}
      {
        thread.summary && (
          <Card>
            <CardHeader>
              <CardTitle>How to help</CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-8 flex flex-col gap-6">
              <div className="text-base text-foreground">
                <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
                  {thread.summary}
                </ReactMarkdown>
              </div>
              {/* CTA Button */}
              <div>
                <HelpOnPlatformButton
                  channel={thread.channel}
                  externalActivityUrl={thread.external_activity_url}
                />
              </div>
            </CardContent>
          </Card>
        )
      }

      {/* Similar Solved Threads */}
      {
        thread.similar_solved_threads && thread.similar_solved_threads.length > 0 && (
          <SimilarSolvedThreads threads={thread.similar_solved_threads} />
        )
      }

      {/* Remaining Replies Section */}
      {
        validReplies.length > 0 && (
          <RepliesList
            replies={validReplies}
            questionAuthor={question?.author || null}
            totalReplyCount={validReplies.length}
          />
        )
      }
    </div >
  )
}

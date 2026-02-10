'use client'

import { createClient } from '@supabase/supabase-js'
import { ThumbsDown, ThumbsUp } from 'lucide-react'
import { useReducer } from 'react'
import { Button, cn } from 'ui'
import type { SimilarThreadFeedbackResponse } from '~/types/contribute'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_CONTRIBUTE_URL as string
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_CONTRIBUTE_PUBLISHABLE_KEY as string

type FeedbackState =
  | { type: 'idle' }
  | { type: 'submitted'; response: SimilarThreadFeedbackResponse }

type FeedbackAction = { event: 'SUBMIT'; response: SimilarThreadFeedbackResponse }

function feedbackReducer(state: FeedbackState, action: FeedbackAction): FeedbackState {
  switch (action.event) {
    case 'SUBMIT':
      if (state.type === 'idle') {
        return { type: 'submitted', response: action.response }
      }
      return state
    default:
      return state
  }
}

interface SimilarThreadsFeedbackProps {
  sourceThreadId: string
  similarThreadId: string
  className?: string
}

export function SimilarThreadsFeedback({
  sourceThreadId,
  similarThreadId,
  className,
}: SimilarThreadsFeedbackProps) {
  const [state, dispatch] = useReducer(feedbackReducer, { type: 'idle' })

  const isIdle = state.type === 'idle'
  const isHelpful = state.type === 'submitted' && state.response === 'helpful'
  const isNotHelpful = state.type === 'submitted' && state.response === 'not_helpful'

  async function submitFeedback(response: SimilarThreadFeedbackResponse) {
    const supabase = createClient(supabaseUrl, supabasePublishableKey)

    const { error } = await supabase.from('similar_threads_feedback').insert({
      source_thread_id: sourceThreadId,
      similar_thread_id: similarThreadId,
      feedback: response,
    })

    if (error) {
      console.error('Error submitting feedback:', error)
    }
  }

  function handleFeedback(response: SimilarThreadFeedbackResponse) {
    submitFeedback(response)
    dispatch({ event: 'SUBMIT', response })
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {isIdle && (
        <>
          <span className="text-xs text-foreground-lighter">Was this helpful?</span>
          <div className="flex items-center gap-1">
            <Button
              type="text"
              size="tiny"
              className={cn(
                'px-1.5 h-6 text-foreground-lighter',
                'hover:text-brand-600 hover:bg-brand-400/10',
                'transition-colors'
              )}
              onClick={() => handleFeedback('helpful')}
            >
              <ThumbsUp size={14} strokeWidth={1.5} />
              <span className="sr-only">Yes, helpful</span>
            </Button>
            <Button
              type="text"
              size="tiny"
              className={cn(
                'px-1.5 h-6 text-foreground-lighter',
                'hover:text-warning hover:bg-warning-400/10',
                'transition-colors'
              )}
              onClick={() => handleFeedback('not_helpful')}
            >
              <ThumbsDown size={14} strokeWidth={1.5} />
              <span className="sr-only">No, not helpful</span>
            </Button>
          </div>
        </>
      )}
      {state.type === 'submitted' && (
        <span
          className={cn(
            'text-xs flex items-center gap-1.5',
            isHelpful && 'text-brand-600',
            isNotHelpful && 'text-foreground-lighter'
          )}
        >
          {isHelpful ? (
            <>
              <ThumbsUp size={12} strokeWidth={1.5} className="text-brand-600" />
              Thanks for your feedback!
            </>
          ) : (
            <>
              <ThumbsDown size={12} strokeWidth={1.5} />
              Thanks, we'll improve this.
            </>
          )}
        </span>
      )}
    </div>
  )
}

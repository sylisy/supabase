import { Tables } from '~/lib/contribute.types'

export type Thread = Tables<'contribute_threads'>

export type ThreadSource = 'discord' | 'reddit' | 'github'

export interface ThreadRow {
  id: string
  title: string
  conversation: string
  user: string
  channel: ThreadSource
  tags: string[]
  product_areas: string[]
  stack: string[]
  posted: string
  source: ThreadSource
  external_activity_url: string
  category: string | null
  sub_category: string | null
  summary: string | null
  thread_key: string | null
  message_count: number | null
}

export type LeaderboardPeriod = 'all' | 'year' | 'quarter' | 'month' | 'week' | 'today'

export type LeaderboardRow = {
  author: string | null // sometimes author can be null
  reply_count: number // bigint comes back as number via supabase-js
}

export interface SimilarThread {
  thread_id: string
  subject: string
  summary: string | null
  problem_type: string | null
  product_areas: string[]
  solution_steps: string[] | null
  match_reason: string | null
  similarity_score: number
  external_activity_url: string | null
  source: ThreadSource
}

export type SimilarThreadFeedbackResponse = 'helpful' | 'not_helpful'

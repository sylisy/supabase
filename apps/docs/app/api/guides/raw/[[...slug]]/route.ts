import { type NextRequest, NextResponse } from 'next/server'

import { mdxToMarkdown } from '~/features/docs/GuidesMdx.mdxToMarkdown'
import { getGuidesMarkdown } from '~/features/docs/GuidesMdx.utils'

/**
 * Returns the preprocessed Markdown source for a guide page.
 *
 * Accessed by appending `.mdx` to any guide URL:
 *   /docs/guides/auth/users  →  /docs/guides/auth/users.mdx
 *
 * The rewrite in next.config.mjs maps:
 *   /guides/:path*.mdx  →  /api/guides/raw/:path*
 *
 * The content returned is the same preprocessed Markdown that the page
 * renders from: partials are expanded, GitHub code samples are inlined,
 * and directives are resolved — but it has NOT been compiled to HTML.
 * This makes it useful for LLMs and "copy as Markdown" tooling.
 *
 * All access control checks (published sections, disabled pages) are
 * enforced by `getGuidesMarkdown`, which calls `notFound()` for any
 * path that should not be publicly accessible.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug?: string[] }> }
) {
  const { slug } = await params

  if (!slug?.length) {
    return new NextResponse('Not found', { status: 404 })
  }

  // Reuses all existing security + navigation checks.
  // Calls notFound() (→ 404) for invalid paths, unpublished sections,
  // and disabled pages.
  const data = await getGuidesMarkdown(slug)
  const rawContent = data.meta.title
    ? `# ${data.meta.title}\n\n${data.content}`
    : data.content
  const body = mdxToMarkdown(rawContent)

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}

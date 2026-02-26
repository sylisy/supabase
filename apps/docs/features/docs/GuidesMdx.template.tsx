import { ExternalLink } from 'lucide-react'
import { type ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'

import { cn } from 'ui'

import Breadcrumbs from '~/components/Breadcrumbs'
import GuidesTableOfContents from '~/components/GuidesTableOfContents'
import { CopyMarkdownButton } from '~/features/docs/CopyMarkdownButton.client'
import { TocAnchorsProvider } from '~/features/docs/GuidesMdx.client'
import { MDXRemoteBase } from '~/features/docs/MdxBase'
import type { WithRequired } from '~/features/helpers.types'
import { BASE_PATH } from '~/lib/constants'
import { type GuideFrontmatter } from '~/lib/docs'
import { SerializeOptions } from '~/types/next-mdx-remote-serialize'

const EDIT_LINK_SYMBOL = Symbol('edit link')
interface EditLink {
  [EDIT_LINK_SYMBOL]: true
  link: string
  includesProtocol: boolean
}

/**
 * Create an object representing a link where the original content can be
 * edited.
 *
 * Takes either a relative path, which will be prefixed with
 * `https://github.com/`, or a full URL including protocol.
 */
const newEditLink = (str: string): EditLink => {
  if (str.startsWith('/')) {
    throw Error(`Edit links cannot start with slashes. Received: ${str}`)
  }

  /**
   * Catch strings that provide FQDNS without https?:
   *
   * At the start of a string, before the first slash, there is a dot
   * surrounded by non-slash characters.
   */
  if (/^[^\/]+\.[^\/]+\//.test(str)) {
    throw Error(`Fully qualified domain names must start with 'https?'. Received: ${str}`)
  }

  return {
    [EDIT_LINK_SYMBOL]: true,
    link: str,
    includesProtocol: str.startsWith('http://') || str.startsWith('https://'),
  }
}

interface BaseGuideTemplateProps {
  meta?: GuideFrontmatter
  content?: string
  children?: ReactNode
  editLink: EditLink
  mdxOptions?: SerializeOptions
  /**
   * The pathname of the guide page (e.g. `/guides/auth/users`).
   * When provided, a "Copy as Markdown" button is rendered below the TOC
   * (or in the article footer when the TOC is hidden).
   * `getGuidesMarkdown` always returns this, so it will be set for all
   * standard guide pages.
   */
  pathname?: `/${string}`
}

type GuideTemplateProps =
  | WithRequired<BaseGuideTemplateProps, 'children'>
  | WithRequired<BaseGuideTemplateProps, 'content'>

const GuideTemplate = ({
  meta,
  content,
  children,
  editLink,
  mdxOptions,
  pathname,
}: GuideTemplateProps) => {
  const hideToc = meta?.hideToc || meta?.hide_table_of_contents

  return (
    <TocAnchorsProvider>
      <div className={'grid grid-cols-12 relative gap-4'}>
        <div
          className={cn(
            'relative',
            'transition-all ease-out',
            'duration-100',
            hideToc ? 'col-span-12' : 'col-span-12 md:col-span-9'
          )}
        >
          <Breadcrumbs className="mb-2" />
          <article
            // Used to get headings for the table of contents
            id="sb-docs-guide-main-article"
            className="prose max-w-none"
          >
            <h1 className="mb-0 [&>p]:m-0">
              <ReactMarkdown>{meta?.title || 'Supabase Docs'}</ReactMarkdown>
            </h1>
            {meta?.subtitle && (
              <h2 className="mt-3 text-xl text-foreground-light">
                <ReactMarkdown>{meta.subtitle}</ReactMarkdown>
              </h2>
            )}
            <hr className="not-prose border-t-0 border-b my-8" />

            {content && (
              <MDXRemoteBase source={content} options={mdxOptions} customPreprocess={(x) => x} />
            )}
            {children}

            <footer className="mt-16 not-prose flex items-center gap-4">
              {/*
               * Show the copy button in the article footer only when the TOC
               * column is hidden — otherwise it lives below the TOC (right column).
               */}
              {pathname && hideToc && (
                <CopyMarkdownButton markdownUrl={`${BASE_PATH}${pathname}.mdx`} />
              )}
              <a
                href={
                  editLink.includesProtocol ? editLink.link : `https://github.com/${editLink.link}`
                }
                className={cn(
                  'w-fit',
                  'flex items-center gap-1',
                  'text-sm text-scale-1000 hover:text-scale-1200',
                  'transition-colors'
                )}
                target="_blank"
                rel="noreferrer noopener edit"
              >
                Edit this page on GitHub <ExternalLink size={14} strokeWidth={1.5} />
              </a>
            </footer>
          </article>
        </div>
        {!hideToc && (
          <div
            className={cn(
              'hidden md:flex',
              'col-span-3 self-start',
              'sticky',
              'top-[calc(var(--header-height)+1px+2rem)]',
              'max-h-[calc(100vh-var(--header-height)-3rem)]'
            )}
          >
            <GuidesTableOfContents video={meta?.tocVideo} className="flex-1 overflow-y-auto">
              {pathname && (
                <CopyMarkdownButton markdownUrl={`${BASE_PATH}${pathname}.mdx`} />
              )}
            </GuidesTableOfContents>
          </div>
        )}
      </div>
    </TocAnchorsProvider>
  )
}

export { GuideTemplate, newEditLink }
export type { EditLink }

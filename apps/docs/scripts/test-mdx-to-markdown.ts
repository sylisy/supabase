/**
 * Scans all guide MDX files, runs them through mdxToMarkdown, then reports
 * anything in the output that still looks like unhandled JSX or MDX
 * expressions — so we know what the transform missed.
 *
 * Usage:
 *   pnpm tsx scripts/test-mdx-to-markdown.ts
 *   pnpm tsx scripts/test-mdx-to-markdown.ts --verbose   # show matched lines
 */

import { readdir, readFile } from 'node:fs/promises'
import { extname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

import { mdxToMarkdown } from '../features/docs/GuidesMdx.mdxToMarkdown.js'

const GUIDES_DIR = fileURLToPath(new URL('../content/guides', import.meta.url))
const VERBOSE = process.argv.includes('--verbose')

// ── Patterns we want to be absent from the output ───────────────────────────

const CHECKS: Array<{ name: string; pattern: RegExp }> = [
  {
    name: 'JSX opening/closing tag',
    pattern: /<\/?[A-Z][A-Za-z.]*\b[^>]*>/,
  },
  {
    name: 'JSX self-closing tag',
    pattern: /<[A-Z][A-Za-z.]*\b[^>]*\/>/,
  },
  {
    name: 'MDX expression block',
    // Catches {someVar}, {/* comment */}, etc. — but not standard markdown
    // things like {id} inside code fences.
    pattern: /(?<!`)\{(?!\s*\/\*)(?:[^`}]{1,80})\}(?!`)/,
  },
  {
    name: 'MDX import/export',
    pattern: /^(import|export)\s+/m,
  },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

interface Hit {
  file: string
  line: number
  text: string
  check: string
}

async function getAllMdxFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { recursive: true })
  return entries
    .filter((f) => extname(f) === '.mdx' && !f.split('/').at(-1)?.startsWith('_'))
    .map((f) => join(dir, f))
}

function findHits(transformed: string, filePath: string): Hit[] {
  const hits: Hit[] = []
  const lines = transformed.split('\n')
  let inFence = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Skip content inside fenced code blocks — JSX there is intentional
    if (/^```/.test(line)) {
      inFence = !inFence
      continue
    }
    if (inFence) continue

    for (const check of CHECKS) {
      if (check.pattern.test(line)) {
        hits.push({
          file: relative(GUIDES_DIR, filePath),
          line: i + 1,
          text: line.trim(),
          check: check.name,
        })
        break // one hit per line is enough
      }
    }
  }

  return hits
}

// ── Main ─────────────────────────────────────────────────────────────────────

const files = await getAllMdxFiles(GUIDES_DIR)
console.log(`Scanning ${files.length} guide files...\n`)

const allHits: Hit[] = []
let errorCount = 0

for (const file of files) {
  try {
    const raw = await readFile(file, 'utf-8')
    const transformed = mdxToMarkdown(raw)
    const hits = findHits(transformed, file)
    allHits.push(...hits)
  } catch (err) {
    console.error(`  ERROR processing ${relative(GUIDES_DIR, file)}: ${err}`)
    errorCount++
  }
}

if (allHits.length === 0) {
  console.log('✓ No unhandled JSX or MDX expressions found.')
} else {
  // Group by check name so it's easy to see what categories need fixing
  const byCheck = Map.groupBy(allHits, (h) => h.check)

  for (const [checkName, hits] of byCheck) {
    console.log(`\n── ${checkName} (${hits.length} hits) ──`)

    // Group by file within each check
    const byFile = Map.groupBy(hits, (h) => h.file)
    for (const [file, fileHits] of byFile) {
      if (VERBOSE) {
        for (const h of fileHits) {
          console.log(`  ${file}:${h.line}`)
          console.log(`    ${h.text}`)
        }
      } else {
        console.log(`  ${file} (${fileHits.length})`)
      }
    }
  }
}

console.log(`
── Summary ──────────────────────────────
  Files scanned : ${files.length}
  Files with hits: ${new Set(allHits.map((h) => h.file)).size}
  Total hits    : ${allHits.length}
  Errors        : ${errorCount}
`)

process.exit(allHits.length > 0 || errorCount > 0 ? 1 : 0)

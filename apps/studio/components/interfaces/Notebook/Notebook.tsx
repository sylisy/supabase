'use client'

import { useMemo, useRef, useState } from 'react'
import YooptaEditor, {
  createYooptaEditor,
  YooptaContentValue,
  YooptaOnChangeOptions,
} from '@yoopta/editor'
import Paragraph from '@yoopta/paragraph'
import { HeadingOne, HeadingTwo, HeadingThree } from '@yoopta/headings'
import { BulletedList, NumberedList } from '@yoopta/lists'
import Divider from '@yoopta/divider'
import { Bold, Italic, CodeMark, Underline, Strike, Highlight } from '@yoopta/marks'
import ActionMenuList from '@yoopta/action-menu-list'
import Toolbar from '@yoopta/toolbar'

import { SQLQueryPlugin } from './plugins/SQLQueryPlugin'
import { CustomActionMenuRender } from './components/CustomActionMenuRender'
import { CustomToolbarRender } from './components/CustomToolbarRender'
import {
  ParagraphRender,
  HeadingOneRender,
  HeadingTwoRender,
  HeadingThreeRender,
  BulletedListRender,
  NumberedListRender,
  DividerRender,
} from './renders'

// Define plugins with custom renders that use Supabase design system
const plugins = [
  Paragraph.extend({
    renders: {
      paragraph: ParagraphRender,
    },
  }),
  HeadingOne.extend({
    renders: {
      'heading-one': HeadingOneRender,
    },
  }),
  HeadingTwo.extend({
    renders: {
      'heading-two': HeadingTwoRender,
    },
  }),
  HeadingThree.extend({
    renders: {
      'heading-three': HeadingThreeRender,
    },
  }),
  BulletedList.extend({
    renders: {
      'bulleted-list': BulletedListRender,
    },
  }),
  NumberedList.extend({
    renders: {
      'numbered-list': NumberedListRender,
    },
  }),
  Divider.extend({
    renders: {
      divider: DividerRender,
    },
  }),
  SQLQueryPlugin,
]

// Define marks
const MARKS = [Bold, Italic, CodeMark, Underline, Strike, Highlight]

// Define tools with custom renders that match Supabase design system
const TOOLS = {
  ActionMenu: {
    render: CustomActionMenuRender,
    tool: ActionMenuList,
  },
  Toolbar: {
    render: CustomToolbarRender,
    tool: Toolbar,
  },
}

// Initial content with a welcome message
const INITIAL_VALUE: YooptaContentValue = {
  '1': {
    id: '1',
    type: 'HeadingOne',
    value: [
      {
        id: '1-element',
        type: 'heading-one',
        children: [{ text: 'Welcome to Notebook' }],
        props: { nodeType: 'block' },
      },
    ],
    meta: { order: 0, depth: 0 },
  },
  '2': {
    id: '2',
    type: 'Paragraph',
    value: [
      {
        id: '2-element',
        type: 'paragraph',
        children: [
          {
            text: 'This is a notebook for exploring your Postgres database. Use the / key to add blocks like text, headings, lists, or SQL queries.',
          },
        ],
        props: { nodeType: 'block' },
      },
    ],
    meta: { order: 1, depth: 0 },
  },
  '3': {
    id: '3',
    type: 'Paragraph',
    value: [
      {
        id: '3-element',
        type: 'paragraph',
        children: [
          { text: 'Try typing /sql to add a SQL query block and start exploring your data.' },
        ],
        props: { nodeType: 'block' },
      },
    ],
    meta: { order: 2, depth: 0 },
  },
}

export function Notebook() {
  const editor = useMemo(() => createYooptaEditor(), [])
  const selectionRef = useRef<HTMLDivElement>(null)
  const [value, setValue] = useState<YooptaContentValue>(INITIAL_VALUE)

  const onChange = (newValue: YooptaContentValue, options: YooptaOnChangeOptions) => {
    setValue(newValue)
  }

  return (
    <div ref={selectionRef} className="h-full w-full overflow-y-auto py-8 px-6 lg:px-12">
      <div className="w-full max-w-none">
        <YooptaEditor
          editor={editor}
          plugins={plugins}
          tools={TOOLS}
          marks={MARKS}
          selectionBoxRoot={selectionRef}
          value={value}
          onChange={onChange}
          autoFocus
          placeholder="Type '/' for commands..."
          style={{
            width: '100%',
            paddingBottom: '200px',
          }}
        />
      </div>
    </div>
  )
}

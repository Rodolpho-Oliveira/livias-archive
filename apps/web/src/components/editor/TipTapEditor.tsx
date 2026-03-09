import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import Image from '@tiptap/extension-image'
import { useCallback, useEffect, useRef } from 'react'
import { EditorToolbar } from './EditorToolbar'

interface Props {
  content: any
  contentKey?: number // bump this to force content reload
  onChange: (content: any, wordCount: number, charCount: number) => void
  focusMode?: boolean
  fontFamily?: string
  fontSize?: number
}

export function TipTapEditor({ content, contentKey, onChange, focusMode = false, fontFamily = 'Georgia', fontSize = 16 }: Props) {
  const isInitialMount = useRef(true)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({
        placeholder: 'Comece a escrever sua história... ✨',
      }),
      CharacterCount,
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
    ],
    content: content || {
      type: 'doc',
      content: [{ type: 'paragraph' }],
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none',
        style: `font-family: ${fontFamily}, serif; font-size: ${fontSize}px;`,
      },
    },
    onUpdate: ({ editor }) => {
      if (isInitialMount.current) return
      const json = editor.getJSON()
      const words = editor.storage.characterCount.words()
      const chars = editor.storage.characterCount.characters()
      onChange(json, words, chars)
    },
  })

  useEffect(() => {
    if (editor && isInitialMount.current) {
      isInitialMount.current = false
    }
  }, [editor])

  // Reload content when contentKey changes (e.g. after version restore)
  useEffect(() => {
    if (editor && contentKey !== undefined && !isInitialMount.current) {
      isInitialMount.current = true
      editor.commands.setContent(content || { type: 'doc', content: [{ type: 'paragraph' }] })
      // Use setTimeout to re-enable onChange after the content is set
      setTimeout(() => {
        isInitialMount.current = false
      }, 0)
    }
  }, [editor, contentKey])

  // Update editor style when font settings change
  useEffect(() => {
    if (editor) {
      editor.setOptions({
        editorProps: {
          attributes: {
            class: 'prose prose-lg max-w-none focus:outline-none',
            style: `font-family: ${fontFamily}, serif; font-size: ${fontSize}px;`,
          },
        },
      })
    }
  }, [editor, fontFamily, fontSize])

  if (!editor) return null

  return (
    <div className={`tiptap-editor ${focusMode ? 'focus-mode' : ''}`}>
      {!focusMode && <EditorToolbar editor={editor} />}
      <div className={`${focusMode ? 'max-w-2xl mx-auto py-8' : 'mt-4'}`}>
        <EditorContent editor={editor} />
      </div>
      {!focusMode && (
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-blush dark:border-dark-border text-sm text-cocoa/40 dark:text-dark-text/40 font-body">
          <span>📝 {editor.storage.characterCount.words()} palavras</span>
          <span>🔤 {editor.storage.characterCount.characters()} caracteres</span>
        </div>
      )}
    </div>
  )
}

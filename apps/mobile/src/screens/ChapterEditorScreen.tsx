import React, { useEffect, useState, useCallback, useRef } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, Alert,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native'
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor'
import { api, Chapter } from '../lib/api'
import { theme } from '../lib/theme'

export function ChapterEditorScreen({ route, navigation }: any) {
  const { bookId, chapterId } = route.params
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const editorRef = useRef<RichEditor>(null)
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null)
  const currentHtml = useRef('')
  const colors = theme.light

  const loadChapter = useCallback(async () => {
    try {
      const data = await api.getChapter(chapterId)
      setChapter(data)
      // Convert TipTap JSON to basic HTML for the editor
      if (data.content) {
        const html = tiptapJsonToHtml(data.content)
        currentHtml.current = html
      }
    } catch {
      Alert.alert('Erro', 'Capítulo não encontrado')
      navigation.goBack()
    } finally {
      setLoading(false)
    }
  }, [chapterId, navigation])

  useEffect(() => {
    loadChapter()
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    }
  }, [loadChapter])

  const saveContent = async () => {
    if (!currentHtml.current) return
    setSaving(true)
    try {
      // Count words
      const plainText = currentHtml.current.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
      const wordCount = plainText ? plainText.split(/\s+/).length : 0
      const charCount = plainText.length

      await api.updateChapter(chapterId, {
        content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: plainText }] }] },
        wordCount,
        charCount,
      })
      setLastSaved(new Date())
    } catch {
      // Silent fail for autosave
    } finally {
      setSaving(false)
    }
  }

  const handleContentChange = (html: string) => {
    currentHtml.current = html
    // Autosave after 3 seconds of inactivity
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(saveContent, 3000)
  }

  if (loading || !chapter) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={styles.loadingEmoji}>✍️</Text>
        <Text style={{ color: colors.primary }}>Abrindo editor...</Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: colors.primary, fontWeight: '600' }}>← Voltar</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
            {chapter.title}
          </Text>
          <Text style={[styles.headerStatus, { color: colors.textSecondary }]}>
            {saving ? '💾 Salvando...' : lastSaved ? `✅ Salvo` : '✨ Autosave'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => { saveContent(); Alert.alert('Salvo!', 'Conteúdo salvo com sucesso 💾') }}
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.saveButtonText}>💾</Text>
        </TouchableOpacity>
      </View>

      {/* Toolbar */}
      <RichToolbar
        editor={editorRef}
        actions={[
          actions.setBold,
          actions.setItalic,
          actions.setUnderline,
          actions.setStrikethrough,
          actions.heading1,
          actions.heading2,
          actions.insertBulletsList,
          actions.insertOrderedList,
          actions.blockquote,
          actions.insertLine,
          actions.undo,
          actions.redo,
        ]}
        style={[styles.toolbar, { backgroundColor: colors.surface, borderColor: colors.border }]}
        iconTint={colors.text}
        selectedIconTint={colors.primary}
      />

      {/* Editor */}
      <ScrollView style={styles.editorContainer}>
        <RichEditor
          ref={editorRef}
          initialContentHTML={currentHtml.current}
          onChange={handleContentChange}
          placeholder="Comece a escrever sua história... ✨"
          editorStyle={{
            backgroundColor: colors.surface,
            color: colors.text,
            caretColor: colors.primary,
            placeholderColor: colors.textSecondary,
            contentCSSText: `
              font-family: Georgia, serif;
              font-size: 16px;
              line-height: 1.8;
              padding: 16px;
            `,
          }}
          style={styles.editor}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

// Simple TipTap JSON to HTML converter
function tiptapJsonToHtml(json: any): string {
  if (!json || !json.content) return ''
  return json.content.map((node: any): string => {
    const children = node.content ? node.content.map((child: any) => {
      if (child.type === 'text') {
        let text = child.text || ''
        if (child.marks) {
          child.marks.forEach((mark: any) => {
            switch (mark.type) {
              case 'bold': text = `<b>${text}</b>`; break
              case 'italic': text = `<i>${text}</i>`; break
              case 'underline': text = `<u>${text}</u>`; break
              case 'strike': text = `<s>${text}</s>`; break
            }
          })
        }
        return text
      }
      return ''
    }).join('') : ''

    switch (node.type) {
      case 'paragraph': return `<p>${children}</p>`
      case 'heading': return `<h${node.attrs?.level || 1}>${children}</h${node.attrs?.level || 1}>`
      case 'bulletList': return `<ul>${children}</ul>`
      case 'orderedList': return `<ol>${children}</ol>`
      case 'listItem': return `<li>${children}</li>`
      case 'blockquote': return `<blockquote>${children}</blockquote>`
      case 'horizontalRule': return '<hr>'
      default: return children
    }
  }).join('')
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingEmoji: { fontSize: 40, marginBottom: 8 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 12, borderBottomWidth: 1 },
  headerCenter: { flex: 1, marginHorizontal: 12 },
  headerTitle: { fontWeight: 'bold', fontSize: 16 },
  headerStatus: { fontSize: 11, marginTop: 2 },
  saveButton: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16 },
  saveButtonText: { fontSize: 16 },
  toolbar: { borderBottomWidth: 1 },
  editorContainer: { flex: 1 },
  editor: { flex: 1, minHeight: 400 },
})

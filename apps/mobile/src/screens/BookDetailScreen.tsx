import React, { useEffect, useState, useCallback } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, TextInput,
} from 'react-native'
import { api, Book, Chapter } from '../lib/api'
import { theme } from '../lib/theme'

const statusLabel = {
  DRAFT: '📝 Rascunho',
  IN_PROGRESS: '✍️ Em andamento',
  COMPLETED: '✅ Concluído',
}

const chStatusLabel = {
  DRAFT: '📝',
  REVISION: '🔍',
  COMPLETED: '✅',
}

export function BookDetailScreen({ route, navigation }: any) {
  const { bookId } = route.params
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const colors = theme.light

  const loadBook = useCallback(async () => {
    try {
      const data = await api.getBook(bookId)
      setBook(data)
    } catch {
      Alert.alert('Erro', 'Livro não encontrado')
      navigation.goBack()
    } finally {
      setLoading(false)
    }
  }, [bookId, navigation])

  useEffect(() => {
    loadBook()
    const unsubscribe = navigation.addListener('focus', loadBook)
    return unsubscribe
  }, [navigation, loadBook])

  const handleCreateChapter = () => {
    Alert.prompt(
      'Novo Capítulo 📄',
      'Título do capítulo:',
      async (title) => {
        if (!title?.trim()) return
        try {
          await api.createChapter({ title, bookId })
          loadBook()
        } catch {
          Alert.alert('Erro', 'Falha ao criar capítulo')
        }
      }
    )
  }

  const handleDeleteChapter = (chapter: Chapter) => {
    Alert.alert(
      'Deletar capítulo?',
      `"${chapter.title}" será perdido permanentemente.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteChapter(chapter.id)
              loadBook()
            } catch {
              Alert.alert('Erro', 'Falha ao deletar')
            }
          },
        },
      ]
    )
  }

  if (loading || !book) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={styles.loadingEmoji}>📖</Text>
        <Text style={{ color: colors.primary }}>Carregando...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Book Header */}
      <View style={[styles.header, { backgroundColor: book.coverColor || '#f4a7bb' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{book.title}</Text>
        <Text style={styles.headerStatus}>{statusLabel[book.status]}</Text>
        {book.genre && <Text style={styles.headerGenre}>{book.genre}</Text>}
        <Text style={styles.headerMeta}>
          📖 {book.chapters?.length || 0} capítulos · ✏️ {(book.totalWords || 0).toLocaleString()} palavras
        </Text>
      </View>

      {book.synopsis && (
        <View style={[styles.synopsisCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.synopsis, { color: colors.textSecondary }]}>{book.synopsis}</Text>
        </View>
      )}

      {/* Chapters */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Capítulos 📑</Text>
        <TouchableOpacity
          onPress={handleCreateChapter}
          style={[styles.addChapterButton, { backgroundColor: colors.secondary }]}
        >
          <Text style={styles.addChapterText}>+ Novo</Text>
        </TouchableOpacity>
      </View>

      {book.chapters && book.chapters.length > 0 ? (
        book.chapters.map((chapter, index) => (
          <TouchableOpacity
            key={chapter.id}
            style={[styles.chapterCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.navigate('ChapterEditor', { bookId, chapterId: chapter.id })}
            onLongPress={() => handleDeleteChapter(chapter)}
            activeOpacity={0.7}
          >
            <View style={[styles.chapterNumber, { backgroundColor: colors.blush }]}>
              <Text style={[styles.chapterNumberText, { color: colors.primary }]}>{index + 1}</Text>
            </View>
            <View style={styles.chapterInfo}>
              <Text style={[styles.chapterTitle, { color: colors.text }]}>{chapter.title}</Text>
              <Text style={[styles.chapterMeta, { color: colors.textSecondary }]}>
                {chStatusLabel[chapter.status]} {chapter.wordCount.toLocaleString()} palavras
              </Text>
            </View>
            <Text style={{ color: colors.textSecondary }}>→</Text>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.emptyChapters}>
          <Text style={styles.emptyEmoji}>📄</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Nenhum capítulo ainda</Text>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingEmoji: { fontSize: 40, marginBottom: 8 },
  header: { padding: 20, paddingTop: 60, paddingBottom: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  backButton: { marginBottom: 12 },
  backText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  headerStatus: { color: '#fff', marginTop: 8, fontSize: 13, opacity: 0.9 },
  headerGenre: { color: '#fff', marginTop: 4, fontSize: 12, opacity: 0.8 },
  headerMeta: { color: '#fff', marginTop: 8, fontSize: 12, opacity: 0.7 },
  synopsisCard: { margin: 16, padding: 16, borderRadius: 16, borderWidth: 1 },
  synopsis: { fontSize: 13, lineHeight: 20, fontStyle: 'italic' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginTop: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  addChapterButton: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16 },
  addChapterText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  chapterCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 8, padding: 14, borderRadius: 16, borderWidth: 1 },
  chapterNumber: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  chapterNumberText: { fontWeight: 'bold', fontSize: 14 },
  chapterInfo: { flex: 1 },
  chapterTitle: { fontWeight: '600', fontSize: 15 },
  chapterMeta: { fontSize: 11, marginTop: 2 },
  emptyChapters: { alignItems: 'center', paddingTop: 40 },
  emptyEmoji: { fontSize: 36, marginBottom: 8 },
  emptyText: { fontSize: 14 },
})

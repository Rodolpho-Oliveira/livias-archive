import React, { useEffect, useState, useCallback } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, TextInput, Alert,
} from 'react-native'
import { api, Book } from '../lib/api'
import { theme } from '../lib/theme'
import { useAuth } from '../hooks/useAuth'

const statusEmoji = {
  DRAFT: '📝',
  IN_PROGRESS: '✍️',
  COMPLETED: '✅',
}

const animals = ['🐰', '🐱', '🦊', '🐻', '🐼', '🦋', '🌸', '🍓', '🌷', '🎀']

export function LibraryScreen({ navigation }: any) {
  const [books, setBooks] = useState<Book[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const { signOut } = useAuth()
  const colors = theme.light

  const loadBooks = useCallback(async () => {
    try {
      const data = await api.getBooks()
      setBooks(data)
    } catch (err: any) {
      Alert.alert('Erro', 'Falha ao carregar livros')
    }
  }, [])

  useEffect(() => {
    loadBooks()
    const unsubscribe = navigation.addListener('focus', loadBooks)
    return unsubscribe
  }, [navigation, loadBooks])

  const onRefresh = async () => {
    setRefreshing(true)
    await loadBooks()
    setRefreshing(false)
  }

  const handleCreateBook = () => {
    Alert.prompt(
      'Novo Livro 📖',
      'Qual o título?',
      async (title) => {
        if (!title?.trim()) return
        try {
          const book = await api.createBook({ title })
          loadBooks()
          navigation.navigate('BookDetail', { bookId: book.id })
        } catch {
          Alert.alert('Erro', 'Falha ao criar livro')
        }
      }
    )
  }

  const filteredBooks = books.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase())
  )

  const renderBook = ({ item }: { item: Book }) => {
    const emoji = animals[item.title.length % animals.length]
    return (
      <TouchableOpacity
        style={[styles.bookCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => navigation.navigate('BookDetail', { bookId: item.id })}
        activeOpacity={0.7}
      >
        <View style={[styles.bookCover, { backgroundColor: item.coverColor || '#f4a7bb' }]}>
          <Text style={styles.coverEmoji}>{emoji}</Text>
          <Text style={styles.coverTitle} numberOfLines={2}>{item.title}</Text>
        </View>
        <View style={styles.bookInfo}>
          <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[styles.bookMeta, { color: colors.textSecondary }]}>
            {statusEmoji[item.status]} {item.chapterCount || 0} capítulos · {(item.totalWords || 0).toLocaleString()} palavras
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Biblioteca 📚</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {books.length} {books.length === 1 ? 'livro' : 'livros'}
          </Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            onPress={handleCreateBook}
            style={[styles.addButton, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.addButtonText}>+ Novo</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={signOut} style={styles.logoutButton}>
            <Text style={{ color: colors.textSecondary }}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="🔍 Buscar livros..."
        placeholderTextColor={colors.textSecondary}
        style={[styles.searchInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
      />

      {/* Book List */}
      <FlatList
        data={filteredBooks}
        renderItem={renderBook}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📚</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Nenhum livro ainda{'\n'}Crie seu primeiro! 🌟
            </Text>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 16 },
  headerButtons: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 13, marginTop: 2 },
  addButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  logoutButton: { padding: 8 },
  searchInput: { marginHorizontal: 16, marginBottom: 16, borderWidth: 2, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14 },
  list: { paddingHorizontal: 12 },
  row: { gap: 8 },
  bookCard: { flex: 1, borderRadius: 16, borderWidth: 1, overflow: 'hidden', marginBottom: 12 },
  bookCover: { height: 120, justifyContent: 'center', alignItems: 'center', padding: 12 },
  coverEmoji: { fontSize: 28, marginBottom: 4, opacity: 0.8 },
  coverTitle: { color: '#fff', fontWeight: 'bold', textAlign: 'center', fontSize: 13, textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  bookInfo: { padding: 10 },
  bookTitle: { fontWeight: 'bold', fontSize: 14 },
  bookMeta: { fontSize: 11, marginTop: 4 },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { textAlign: 'center', fontSize: 14, lineHeight: 22 },
})

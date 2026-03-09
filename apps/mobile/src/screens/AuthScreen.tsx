import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native'
import { useAuth } from '../hooks/useAuth'
import { theme } from '../lib/theme'

export function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()

  const colors = theme.light

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Ops!', 'Preencha todos os campos 🐰')
      return
    }
    setLoading(true)
    try {
      if (isLogin) {
        await signIn(email, password)
      } else {
        await signUp(email, password, name)
        Alert.alert('Sucesso!', 'Conta criada! Verifique seu email 💌')
      }
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Algo deu errado...')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.emoji}>🐰</Text>
        <Text style={[styles.title, { color: colors.text }]}>Livia's Archive</Text>
        <Text style={[styles.subtitle, { color: colors.primary }]}>
          Seu cantinho fofo para escrever ✨
        </Text>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.tabs}>
            <TouchableOpacity
              onPress={() => setIsLogin(true)}
              style={[styles.tab, isLogin && { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>
                Entrar 🌟
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsLogin(false)}
              style={[styles.tab, !isLogin && { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>
                Criar conta 🌈
              </Text>
            </TouchableOpacity>
          </View>

          {!isLogin && (
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Seu nome 🎀"
              placeholderTextColor={colors.textSecondary}
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            />
          )}

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email 💌"
            placeholderTextColor={colors.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          />

          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Senha 🔑"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          />

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={[styles.button, { backgroundColor: colors.primary, opacity: loading ? 0.6 : 1 }]}
          >
            <Text style={styles.buttonText}>
              {loading ? '...' : isLogin ? 'Entrar ✨' : 'Criar conta 🎉'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.footer, { color: colors.textSecondary }]}>
          Feito com 💖 para escrever histórias lindas
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  emoji: { fontSize: 56, textAlign: 'center', marginBottom: 8 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
  subtitle: { fontSize: 14, textAlign: 'center', marginTop: 4, marginBottom: 32 },
  card: { borderRadius: 16, padding: 20, borderWidth: 2 },
  tabs: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 20, alignItems: 'center' },
  tabText: { fontWeight: '600', color: '#6B4E4E80' },
  tabTextActive: { color: '#fff' },
  input: { borderWidth: 2, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 12, fontSize: 15 },
  button: { borderRadius: 20, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  footer: { textAlign: 'center', fontSize: 12, marginTop: 24 },
})

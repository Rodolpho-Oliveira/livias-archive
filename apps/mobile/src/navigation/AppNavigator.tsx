import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useAuth } from '../hooks/useAuth'
import { AuthScreen } from '../screens/AuthScreen'
import { LibraryScreen } from '../screens/LibraryScreen'
import { BookDetailScreen } from '../screens/BookDetailScreen'
import { ChapterEditorScreen } from '../screens/ChapterEditorScreen'
import { View, Text, StyleSheet } from 'react-native'

const Stack = createNativeStackNavigator()

function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <Text style={styles.loadingEmoji}>🐰</Text>
      <Text style={styles.loadingText}>Livia's Archive</Text>
    </View>
  )
}

export function AppNavigator() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingScreen />

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Library" component={LibraryScreen} />
            <Stack.Screen name="BookDetail" component={BookDetailScreen} />
            <Stack.Screen name="ChapterEditor" component={ChapterEditorScreen} />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF8F0' },
  loadingEmoji: { fontSize: 56, marginBottom: 8 },
  loadingText: { fontSize: 20, fontWeight: 'bold', color: '#6B4E4E' },
})

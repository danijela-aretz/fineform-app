import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { messagesApi, Message } from '../api/messages'

interface MessagesScreenProps {
  route: {
    params: {
      entityTaxYearId: string
    }
  }
}

export default function MessagesScreen({ route }: MessagesScreenProps) {
  const { entityTaxYearId } = route.params
  const [messages, setMessages] = useState<Message[]>([])
  const [threadId, setThreadId] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const flatListRef = useRef<FlatList>(null)

  useEffect(() => {
    loadThread()
  }, [])

  useEffect(() => {
    if (threadId) {
      loadMessages()
      // Poll for new messages every 5 seconds
      const interval = setInterval(loadMessages, 5000)
      return () => clearInterval(interval)
    }
  }, [threadId])

  const loadThread = async () => {
    try {
      const thread = await messagesApi.getThreadByEntityTaxYear(entityTaxYearId)
      setThreadId(thread.id)
    } catch (error: any) {
      console.error('Failed to load thread:', error)
      setLoading(false)
    }
  }

  const loadMessages = async () => {
    if (!threadId) return

    try {
      const data = await messagesApi.getMessages(threadId)
      setMessages(data)
      setLoading(false)

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true })
      }, 100)
    } catch (error: any) {
      console.error('Failed to load messages:', error)
    }
  }

  const handleSend = async () => {
    if (!newMessage.trim() || !threadId || sending) return

    try {
      setSending(true)
      const message = await messagesApi.sendMessage(threadId, newMessage.trim())
      setMessages((prev) => [...prev, message])
      setNewMessage('')
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true })
      }, 100)
    } catch (error: any) {
      console.error('Failed to send message:', error)
    } finally {
      setSending(false)
    }
  }

  const renderMessage = ({ item }: { item: Message }) => {
    const isClient = item.senderType === 'CLIENT'
    
    return (
      <View
        style={[
          styles.messageContainer,
          isClient ? styles.clientMessage : styles.staffMessage,
        ]}
      >
        <Text style={[styles.messageSender, isClient ? { color: '#fff' } : { color: '#1f2937' }]}>
          {item.senderName || (isClient ? 'You' : 'Staff')}
        </Text>
        <Text style={[styles.messageContent, isClient ? { color: '#fff' } : { color: '#1f2937' }]}>
          {item.content}
        </Text>
        <Text style={[styles.messageTime, isClient ? { color: 'rgba(255, 255, 255, 0.7)' } : { color: '#6b7280' }]}>
          {new Date(item.createdAt).toLocaleTimeString()}
        </Text>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          multiline={true}
          maxLength={1000}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!newMessage.trim() || sending) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!newMessage.trim() || sending}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    maxWidth: '80%',
  },
  clientMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#3b82f6',
  },
  staffMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  messageSender: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  messageContent: {
    fontSize: 14,
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#d1d5db',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
})


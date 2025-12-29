import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { clientEntitiesApi, ClientEntityTaxYear } from '../api/clientEntities'

export default function EntitySelectionScreen() {
  const navigation = useNavigation()
  const [entities, setEntities] = useState<ClientEntityTaxYear[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEntities()
  }, [])

  const loadEntities = async () => {
    try {
      setLoading(true)
      const data = await clientEntitiesApi.getEntities()
      setEntities(data)
    } catch (error: any) {
      console.error('Failed to load entities:', error)
      Alert.alert(
        'Error',
        error.response?.data?.message || error.message || 'Failed to load entities'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleSelectEntity = (entityTaxYear: ClientEntityTaxYear) => {
    // @ts-ignore
    navigation.navigate('Home', { entityTaxYearId: entityTaxYear.id })
  }

  const renderEntity = ({ item }: { item: ClientEntityTaxYear }) => {
    const getStatusColor = () => {
      if (item.engagementStatus === 'FULLY_SIGNED') {
        return '#059669' // Green
      }
      if (item.engagementStatus === 'PARTIALLY_SIGNED') {
        return '#f59e0b' // Yellow
      }
      return '#6b7280' // Gray
    }

    return (
      <TouchableOpacity
        style={styles.entityCard}
        onPress={() => handleSelectEntity(item)}
      >
        <View style={styles.entityHeader}>
          <Text style={styles.entityName}>{item.entityName}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusText}>
              {item.engagementStatus === 'FULLY_SIGNED' ? 'Active' : 'Pending'}
            </Text>
          </View>
        </View>
        <Text style={styles.entityDetails}>
          {item.accountName} • Tax Year {item.taxYear}
        </Text>
        <Text style={styles.entityType}>{item.entityType.replace('_', ' ')}</Text>
      </TouchableOpacity>
    )
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Loading entities...</Text>
      </View>
    )
  }

  if (entities.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyTitle}>No Entities Available</Text>
        <Text style={styles.emptyText}>
          You don't have access to any entities yet.{'\n'}
          Please contact your tax preparer to get started.
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Entity</Text>
        <Text style={styles.subtitle}>Choose an entity to view your tax status</Text>
      </View>
      <FlatList
        data={entities}
        renderItem={renderEntity}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  list: {
    padding: 16,
  },
  entityCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  entityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entityName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  entityDetails: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  entityType: {
    fontSize: 12,
    color: '#9ca3af',
    textTransform: 'capitalize',
  },
})



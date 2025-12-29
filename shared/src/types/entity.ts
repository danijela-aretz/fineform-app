import { InternalStatus, EngagementStatus } from '../constants/statuses'

export interface ClientEntity {
  id: string
  accountId: string
  entityName: string
  entityType: string
  status?: string | null
  isRestricted: boolean
  createdAt: Date
  updatedAt: Date
}

export interface EntityTaxYear {
  id: string
  clientEntityId: string
  taxYear: number
  internalStatus: InternalStatus
  engagementStatus: EngagementStatus
  readyForPrep: boolean
  createdAt: Date
  updatedAt: Date
}


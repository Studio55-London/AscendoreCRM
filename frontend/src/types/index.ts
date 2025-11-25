export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  name?: string  // Optional computed field
  role?: string  // Optional field
  createdAt?: string  // Optional field
}

export interface AuthResponse {
  token: string
  user: User
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
}

export interface Contact {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  companyId?: string
  position?: string
  tags?: string[]
  notes?: string
  leadScore?: number
  leadGrade?: string
  createdAt: string
  updatedAt: string
}

export interface Company {
  id: string
  name: string
  domain?: string
  industry?: string
  size?: string
  website?: string
  phone?: string
  address?: string
  tags?: string[]
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Deal {
  id: string
  title: string
  value: number
  currency: string
  stage: string
  probability: number
  expectedCloseDate?: string
  contactId?: string
  companyId?: string
  ownerId: string
  notes?: string
  tags?: string[]
  createdAt: string
  updatedAt: string
  contact?: Contact
  company?: Company
}

export interface Activity {
  id: string
  type: 'call' | 'email' | 'meeting' | 'task' | 'note'
  title: string
  description?: string
  dueDate?: string
  completed: boolean
  contactId?: string
  companyId?: string
  dealId?: string
  campaignId?: string
  tags?: string[]
  ownerId: string
  createdAt: string
  updatedAt: string
}

export interface Campaign {
  id: string
  name: string
  description?: string
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived'
  startDate?: string
  endDate?: string
  goalType?: 'revenue' | 'deals' | 'contacts' | 'activities'
  goalValue?: number
  currentProgress?: number
  contactIds?: string[]
  activityIds?: string[]
  ownerId: string
  tags?: string[]
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface CampaignWithDetails extends Campaign {
  contacts?: Contact[]
  activities?: Activity[]
  deals?: Deal[]
}

export interface ContactFilter {
  tags?: string[]
  leadScore?: { min?: number; max?: number }
  leadGrade?: string[]
  company?: string
  createdAfter?: string
  createdBefore?: string
}

export interface DashboardMetrics {
  totalDeals: number
  totalValue: number
  wonDeals: number
  lostDeals: number
  activeContacts: number
  activeCompanies: number
  activitiesThisWeek: number
  conversionRate: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: {
    action?: string
    data?: any
    error?: boolean
  }
}

export interface ChatCommand {
  command: string
  description: string
  examples: string[]
  category: string
}

export type DealStage =
  | 'lead'
  | 'qualified'
  | 'proposal'
  | 'negotiation'
  | 'closed_won'
  | 'closed_lost'

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

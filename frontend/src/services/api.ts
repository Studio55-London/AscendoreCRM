import axios, { AxiosInstance, AxiosError } from 'axios'
import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
  Contact,
  Company,
  Deal,
  Activity,
  Campaign,
  CampaignWithDetails,
  ContactFilter,
  DashboardMetrics,
  PaginatedResponse,
} from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

class ApiService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await this.api.post<{ success: boolean; data: AuthResponse }>('/api/v1/auth/login', credentials)
    return data.data
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    const { data } = await this.api.post<{ success: boolean; data: AuthResponse }>('/api/v1/auth/register', userData)
    return data.data
  }

  async getCurrentUser(): Promise<User> {
    const { data } = await this.api.get<User>('/api/v1/auth/me')
    return data
  }

  // Contact endpoints
  async getContacts(params?: {
    page?: number
    limit?: number
    offset?: number
    search?: string
  }): Promise<PaginatedResponse<Contact>> {
    const { data } = await this.api.get<{ success: boolean; data: Contact[]; pagination: { page: number; limit: number; total: number; total_pages: number } }>('/api/v1/a-crm/contacts', {
      params,
    })
    return {
      data: data.data,
      total: data.pagination.total,
      page: data.pagination.page,
      limit: data.pagination.limit,
      totalPages: data.pagination.total_pages,
    }
  }

  async getContact(id: string): Promise<Contact> {
    const { data } = await this.api.get<Contact>(`/api/v1/a-crm/contacts/${id}`)
    return data
  }

  async createContact(contact: Partial<Contact>): Promise<Contact> {
    const { data } = await this.api.post<Contact>('/api/v1/a-crm/contacts', contact)
    return data
  }

  async updateContact(id: string, contact: Partial<Contact>): Promise<Contact> {
    const { data } = await this.api.put<Contact>(`/api/v1/a-crm/contacts/${id}`, contact)
    return data
  }

  async deleteContact(id: string): Promise<void> {
    await this.api.delete(`/api/v1/a-crm/contacts/${id}`)
  }

  // Company endpoints
  async getCompanies(params?: {
    page?: number
    limit?: number
    offset?: number
    search?: string
  }): Promise<PaginatedResponse<Company>> {
    const { data } = await this.api.get<{ success: boolean; data: Company[]; pagination: { page: number; limit: number; total: number; total_pages: number } }>('/api/v1/a-crm/companies', {
      params,
    })
    return {
      data: data.data,
      total: data.pagination.total,
      page: data.pagination.page,
      limit: data.pagination.limit,
      totalPages: data.pagination.total_pages,
    }
  }

  async getCompany(id: string): Promise<Company> {
    const { data } = await this.api.get<Company>(`/api/v1/a-crm/companies/${id}`)
    return data
  }

  async createCompany(company: Partial<Company>): Promise<Company> {
    const { data } = await this.api.post<Company>('/api/v1/a-crm/companies', company)
    return data
  }

  async updateCompany(id: string, company: Partial<Company>): Promise<Company> {
    const { data } = await this.api.put<Company>(`/api/v1/a-crm/companies/${id}`, company)
    return data
  }

  async deleteCompany(id: string): Promise<void> {
    await this.api.delete(`/api/v1/a-crm/companies/${id}`)
  }

  // Deal endpoints
  async getDeals(params?: {
    page?: number
    limit?: number
    offset?: number
    stage?: string
  }): Promise<PaginatedResponse<Deal>> {
    const { data } = await this.api.get<{ success: boolean; data: any[]; pagination: { page: number; limit: number; total: number; total_pages: number } }>('/api/v1/a-crm/deals', { params })
    // Transform backend field names to frontend field names
    const transformedDeals = data.data.map(deal => ({
      id: deal.id,
      title: deal.name,  // Backend uses 'name', frontend uses 'title'
      value: deal.amount || 0,  // Backend uses 'amount', frontend uses 'value'
      currency: deal.currency || 'USD',
      stage: deal.stage,
      probability: deal.probability || 0,
      expectedCloseDate: deal.expected_close_date,
      contactId: deal.primary_contact_id,
      companyId: deal.company_id,
      ownerId: deal.owner_id,
      notes: deal.description,
      tags: deal.tags || [],
      createdAt: deal.created_at,
      updatedAt: deal.updated_at,
      contact: deal.contact_name ? { name: deal.contact_name } : undefined,
      company: deal.company_name ? { name: deal.company_name } : undefined,
    }))
    return {
      data: transformedDeals,
      total: data.pagination.total,
      page: data.pagination.page,
      limit: data.pagination.limit,
      totalPages: data.pagination.total_pages,
    }
  }

  async getDeal(id: string): Promise<Deal> {
    const { data } = await this.api.get<Deal>(`/api/v1/a-crm/deals/${id}`)
    return data
  }

  async createDeal(deal: Partial<Deal>): Promise<Deal> {
    const { data } = await this.api.post<Deal>('/api/v1/a-crm/deals', deal)
    return data
  }

  async updateDeal(id: string, deal: Partial<Deal>): Promise<Deal> {
    const { data } = await this.api.put<Deal>(`/api/v1/a-crm/deals/${id}`, deal)
    return data
  }

  async deleteDeal(id: string): Promise<void> {
    await this.api.delete(`/api/v1/a-crm/deals/${id}`)
  }

  // Activity endpoints
  async getActivities(params?: {
    page?: number
    limit?: number
    offset?: number
    type?: string
  }): Promise<PaginatedResponse<Activity>> {
    const { data } = await this.api.get<{ success: boolean; data: any[]; pagination: { page: number; limit: number; total: number; total_pages: number } }>('/api/v1/a-crm/activities', {
      params,
    })
    // Transform backend field names to frontend field names
    const transformedActivities = data.data.map(activity => ({
      id: activity.id,
      type: activity.activity_type || 'task',
      title: activity.description || 'Activity',
      description: activity.metadata?.notes || '',
      dueDate: activity.due_date,
      completed: activity.completed || false,
      contactId: activity.entity_type === 'contact' ? activity.entity_id : undefined,
      companyId: activity.company_id,
      dealId: activity.entity_type === 'deal' ? activity.entity_id : undefined,
      tags: [],
      ownerId: activity.user_id,
      createdAt: activity.created_at,
      updatedAt: activity.updated_at || activity.created_at,
    }))
    return {
      data: transformedActivities,
      total: data.pagination.total,
      page: data.pagination.page,
      limit: data.pagination.limit,
      totalPages: data.pagination.total_pages,
    }
  }

  async createActivity(activity: Partial<Activity>): Promise<Activity> {
    const { data } = await this.api.post<Activity>('/api/v1/a-crm/activities', activity)
    return data
  }

  async updateActivity(id: string, activity: Partial<Activity>): Promise<Activity> {
    const { data } = await this.api.put<Activity>(`/api/v1/a-crm/activities/${id}`, activity)
    return data
  }

  async deleteActivity(id: string): Promise<void> {
    await this.api.delete(`/api/v1/a-crm/activities/${id}`)
  }

  // Campaign endpoints
  async getCampaigns(params?: {
    page?: number
    limit?: number
    offset?: number
    status?: string
  }): Promise<PaginatedResponse<Campaign>> {
    const { data } = await this.api.get<{ success: boolean; data: Campaign[]; pagination: { page: number; limit: number; total: number; total_pages: number } }>('/api/v1/a-crm/campaigns', {
      params,
    })
    return {
      data: data.data,
      total: data.pagination.total,
      page: data.pagination.page,
      limit: data.pagination.limit,
      totalPages: data.pagination.total_pages,
    }
  }

  async getCampaign(id: string): Promise<CampaignWithDetails> {
    const { data } = await this.api.get<CampaignWithDetails>(`/api/v1/a-crm/campaigns/${id}`)
    return data
  }

  async createCampaign(campaign: Partial<Campaign>): Promise<Campaign> {
    const { data } = await this.api.post<Campaign>('/api/v1/a-crm/campaigns', campaign)
    return data
  }

  async updateCampaign(id: string, campaign: Partial<Campaign>): Promise<Campaign> {
    const { data } = await this.api.put<Campaign>(`/api/v1/a-crm/campaigns/${id}`, campaign)
    return data
  }

  async deleteCampaign(id: string): Promise<void> {
    await this.api.delete(`/api/v1/a-crm/campaigns/${id}`)
  }

  async addContactsToCampaign(campaignId: string, contactIds: string[]): Promise<void> {
    await this.api.post(`/api/v1/a-crm/campaigns/${campaignId}/contacts`, { contactIds })
  }

  async removeContactsFromCampaign(campaignId: string, contactIds: string[]): Promise<void> {
    await this.api.delete(`/api/v1/a-crm/campaigns/${campaignId}/contacts`, { data: { contactIds } })
  }

  async addContactsToCampaignByFilter(campaignId: string, filter: ContactFilter): Promise<{ added: number }> {
    const { data } = await this.api.post<{ added: number }>(
      `/api/v1/a-crm/campaigns/${campaignId}/contacts/filter`,
      { filter }
    )
    return data
  }

  // Dashboard
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const { data } = await this.api.get<DashboardMetrics>('/api/v1/a-crm/dashboard/metrics')
    return data
  }

  // AI Chat endpoint
  async sendChatMessage(message: string): Promise<{ response: string; action?: any }> {
    const { data } = await this.api.post<{ response: string; action?: any }>(
      '/api/v1/a-crm/chat',
      { message }
    )
    return data
  }
}

export const api = new ApiService()

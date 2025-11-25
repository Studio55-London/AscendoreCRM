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
    search?: string
  }): Promise<PaginatedResponse<Contact>> {
    const { data } = await this.api.get<PaginatedResponse<Contact>>('/api/v1/a-crm/contacts', {
      params,
    })
    return data
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
    search?: string
  }): Promise<PaginatedResponse<Company>> {
    const { data } = await this.api.get<PaginatedResponse<Company>>('/api/v1/a-crm/companies', {
      params,
    })
    return data
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
    stage?: string
  }): Promise<PaginatedResponse<Deal>> {
    const { data } = await this.api.get<PaginatedResponse<Deal>>('/api/v1/a-crm/deals', { params })
    return data
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
    type?: string
  }): Promise<PaginatedResponse<Activity>> {
    const { data } = await this.api.get<PaginatedResponse<Activity>>('/api/v1/a-crm/activities', {
      params,
    })
    return data
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
    status?: string
  }): Promise<PaginatedResponse<Campaign>> {
    const { data } = await this.api.get<PaginatedResponse<Campaign>>('/api/v1/a-crm/campaigns', {
      params,
    })
    return data
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

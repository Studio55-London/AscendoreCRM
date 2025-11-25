import { api } from './api'
import type { LoginCredentials, RegisterData, User } from '@/types'

export const authService = {
  async login(credentials: LoginCredentials) {
    const response = await api.login(credentials)
    // Add computed name field
    const userWithName = {
      ...response.user,
      name: `${response.user.first_name} ${response.user.last_name}`.trim()
    }
    localStorage.setItem('token', response.token)
    localStorage.setItem('user', JSON.stringify(userWithName))
    return { ...response, user: userWithName }
  },

  async register(userData: RegisterData) {
    const response = await api.register(userData)
    // Add computed name field
    const userWithName = {
      ...response.user,
      name: `${response.user.first_name} ${response.user.last_name}`.trim()
    }
    localStorage.setItem('token', response.token)
    localStorage.setItem('user', JSON.stringify(userWithName))
    return { ...response, user: userWithName }
  },

  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  getToken(): string | null {
    return localStorage.getItem('token')
  },

  getUser(): User | null {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },

  isAuthenticated(): boolean {
    return !!this.getToken()
  },
}

import { useEffect, useState } from 'react'
import { DashboardStats } from '@/components/crm/DashboardStats'
import { ContactList } from '@/components/crm/ContactList'
import { DealsPipeline } from '@/components/crm/DealsPipeline'
import { DealForecasting } from '@/components/crm/DealForecasting'
import { RevenueTrendChart } from '@/components/crm/RevenueTrendChart'
import { DealPipelineChart } from '@/components/crm/DealPipelineChart'
import { WinLossChart } from '@/components/crm/WinLossChart'
import { ActivityTimeline } from '@/components/crm/ActivityTimeline'
import { api } from '@/services/api'
import type { DashboardMetrics, Contact, Deal, Activity } from '@/types'
import { FloatingChat } from '@/components/chat/FloatingChat'

export function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [deals, setDeals] = useState<Deal[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsData, contactsData, dealsData, activitiesData] = await Promise.all([
          api.getDashboardMetrics().catch(() => ({
            totalDeals: 0,
            totalValue: 0,
            wonDeals: 0,
            lostDeals: 0,
            activeContacts: 0,
            activeCompanies: 0,
            activitiesThisWeek: 0,
            conversionRate: 0,
          })),
          api.getContacts({ limit: 5 }).catch(() => ({ data: [], total: 0, page: 1, limit: 5, totalPages: 0 })),
          api.getDeals({ limit: 10 }).catch(() => ({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 })),
          api.getActivities({ limit: 10 }).catch(() => ({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 })),
        ])

        setMetrics(metricsData)
        setContacts(contactsData.data)
        setDeals(dealsData.data)
        setActivities(activitiesData.data)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your CRM overview.</p>
      </div>

      <DashboardStats metrics={metrics} loading={loading} />

      <DealForecasting deals={deals} />

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueTrendChart deals={deals} />
        <DealPipelineChart deals={deals} />
      </div>

      <WinLossChart deals={deals} />

      {/* Activity Timeline & Detailed Lists */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ActivityTimeline activities={activities} loading={loading} />
        <ContactList contacts={contacts} loading={loading} />
      </div>

      <DealsPipeline deals={deals} loading={loading} />

      <FloatingChat />
    </div>
  )
}

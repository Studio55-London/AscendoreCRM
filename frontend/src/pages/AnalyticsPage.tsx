import { useEffect, useState } from 'react'
import { DashboardStats } from '@/components/crm/DashboardStats'
import { RevenueTrendChart } from '@/components/crm/RevenueTrendChart'
import { DealPipelineChart } from '@/components/crm/DealPipelineChart'
import { WinLossChart } from '@/components/crm/WinLossChart'
import { DealForecasting } from '@/components/crm/DealForecasting'
import { ConversionFunnelChart } from '@/components/crm/ConversionFunnelChart'
import { ActivityAnalyticsChart } from '@/components/crm/ActivityAnalyticsChart'
import { api } from '@/services/api'
import type { DashboardMetrics, Contact, Deal, Activity } from '@/types'
import { FloatingChat } from '@/components/chat/FloatingChat'

export function AnalyticsPage() {
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
          api.getContacts({ limit: 100 }).catch(() => ({ data: [] })),
          api.getDeals({ limit: 100 }).catch(() => ({ data: [] })),
          api.getActivities({ limit: 100 }).catch(() => ({ data: [] })),
        ])

        setMetrics(metricsData)
        setContacts(contactsData.data)
        setDeals(dealsData.data)
        setActivities(activitiesData.data)
      } catch (error) {
        console.error('Failed to fetch analytics data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Comprehensive insights and performance metrics</p>
      </div>

      {/* Key Metrics */}
      <DashboardStats metrics={metrics} loading={loading} />

      {/* Forecasting */}
      <DealForecasting deals={deals} />

      {/* Conversion & Activity Analytics */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ConversionFunnelChart contacts={contacts} deals={deals} />
        <ActivityAnalyticsChart activities={activities} />
      </div>

      {/* Revenue & Pipeline Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueTrendChart deals={deals} />
        <DealPipelineChart deals={deals} />
      </div>

      {/* Win/Loss Analysis */}
      <WinLossChart deals={deals} />

      <FloatingChat />
    </div>
  )
}

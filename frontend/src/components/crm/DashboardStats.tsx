import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, TrendingUp, Users, Building2 } from 'lucide-react'
import { formatCurrency } from '@/utils/format'
import type { DashboardMetrics } from '@/types'

interface DashboardStatsProps {
  metrics: DashboardMetrics | null
  loading: boolean
}

export function DashboardStats({ metrics, loading }: DashboardStatsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-24 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!metrics) return null

  const stats = [
    {
      title: 'Total Deals Value',
      value: formatCurrency(metrics.totalValue),
      icon: DollarSign,
      description: `${metrics.totalDeals} total deals`,
    },
    {
      title: 'Won Deals',
      value: metrics.wonDeals.toString(),
      icon: TrendingUp,
      description: `${metrics.conversionRate}% conversion rate`,
    },
    {
      title: 'Active Contacts',
      value: metrics.activeContacts.toString(),
      icon: Users,
      description: 'In your pipeline',
    },
    {
      title: 'Companies',
      value: metrics.activeCompanies.toString(),
      icon: Building2,
      description: 'Active accounts',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatCurrency } from '@/utils/format'
import type { Deal } from '@/types'
import { TrendingUp } from 'lucide-react'

interface RevenueTrendChartProps {
  deals: Deal[]
}

export function RevenueTrendChart({ deals }: RevenueTrendChartProps) {
  const chartData = useMemo(() => {
    // Get last 6 months
    const months = []
    const now = new Date()

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        date: date,
      })
    }

    // Group deals by month
    const dealsByMonth = deals.reduce((acc, deal) => {
      const closeDate = deal.expectedCloseDate ? new Date(deal.expectedCloseDate) : deal.createdAt ? new Date(deal.createdAt) : new Date()
      const monthKey = `${closeDate.getMonth()}-${closeDate.getFullYear()}`

      if (!acc[monthKey]) {
        acc[monthKey] = { won: 0, pipeline: 0, lost: 0 }
      }

      if (deal.stage === 'closed_won') {
        acc[monthKey].won += deal.value
      } else if (deal.stage === 'closed_lost') {
        acc[monthKey].lost += deal.value
      } else {
        acc[monthKey].pipeline += deal.value
      }

      return acc
    }, {} as Record<string, { won: number; pipeline: number; lost: number }>)

    // Map to chart data
    return months.map(({ month, date }) => {
      const monthKey = `${date.getMonth()}-${date.getFullYear()}`
      const data = dealsByMonth[monthKey] || { won: 0, pipeline: 0, lost: 0 }

      return {
        month,
        won: data.won,
        pipeline: data.pipeline,
        lost: data.lost,
      }
    })
  }, [deals])

  const totals = useMemo(() => {
    return chartData.reduce(
      (acc, month) => ({
        won: acc.won + month.won,
        pipeline: acc.pipeline + month.pipeline,
        lost: acc.lost + month.lost,
      }),
      { won: 0, pipeline: 0, lost: 0 }
    )
  }, [chartData])

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium mb-2">{payload[0].payload.month}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Revenue Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-muted-foreground">Total Won</div>
            <div className="text-lg font-bold text-green-600">{formatCurrency(totals.won)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Total Pipeline</div>
            <div className="text-lg font-bold text-blue-600">{formatCurrency(totals.pipeline)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Total Lost</div>
            <div className="text-lg font-bold text-red-600">{formatCurrency(totals.lost)}</div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="month"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="won"
              name="Won"
              stroke="hsl(142, 76%, 36%)"
              strokeWidth={2}
              dot={{ fill: 'hsl(142, 76%, 36%)' }}
            />
            <Line
              type="monotone"
              dataKey="pipeline"
              name="Pipeline"
              stroke="hsl(221, 83%, 53%)"
              strokeWidth={2}
              dot={{ fill: 'hsl(221, 83%, 53%)' }}
            />
            <Line
              type="monotone"
              dataKey="lost"
              name="Lost"
              stroke="hsl(0, 84%, 60%)"
              strokeWidth={2}
              dot={{ fill: 'hsl(0, 84%, 60%)' }}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

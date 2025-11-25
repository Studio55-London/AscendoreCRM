import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { formatCurrency } from '@/utils/format'
import type { Deal } from '@/types'
import { Target } from 'lucide-react'

interface WinLossChartProps {
  deals: Deal[]
}

export function WinLossChart({ deals }: WinLossChartProps) {
  const chartData = useMemo(() => {
    const closedDeals = deals.filter(
      deal => deal.stage === 'closed_won' || deal.stage === 'closed_lost'
    )

    const won = closedDeals.filter(d => d.stage === 'closed_won')
    const lost = closedDeals.filter(d => d.stage === 'closed_lost')

    const wonValue = won.reduce((sum, deal) => sum + deal.value, 0)
    const lostValue = lost.reduce((sum, deal) => sum + deal.value, 0)

    return [
      {
        name: 'Won',
        value: wonValue,
        count: won.length,
        color: '#22c55e',
      },
      {
        name: 'Lost',
        value: lostValue,
        count: lost.length,
        color: '#ef4444',
      },
    ]
  }, [deals])

  const totals = useMemo(() => {
    const totalValue = chartData.reduce((sum, item) => sum + item.value, 0)
    const totalCount = chartData.reduce((sum, item) => sum + item.count, 0)
    const wonData = chartData.find(item => item.name === 'Won')
    const winRate = totalCount > 0 ? ((wonData?.count || 0) / totalCount) * 100 : 0

    return {
      totalValue,
      totalCount,
      winRate,
    }
  }, [chartData])

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const percentage = totals.totalValue > 0 ? ((data.value / totals.totalValue) * 100).toFixed(1) : '0'

      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium mb-1" style={{ color: data.color }}>
            {data.name}
          </p>
          <p className="text-sm">Value: {formatCurrency(data.value)}</p>
          <p className="text-sm text-muted-foreground">{data.count} deals ({percentage}%)</p>
        </div>
      )
    }
    return null
  }

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180))
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180))

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-sm font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  if (totals.totalCount === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Win/Loss Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            No closed deals to display
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Win/Loss Rate
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-muted-foreground">Win Rate</div>
            <div className="text-lg font-bold text-green-600">
              {totals.winRate.toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Total Value</div>
            <div className="text-lg font-bold">{formatCurrency(totals.totalValue)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Closed Deals</div>
            <div className="text-lg font-bold">{totals.totalCount}</div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={CustomLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

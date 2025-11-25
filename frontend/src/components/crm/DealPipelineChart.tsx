import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { formatCurrency } from '@/utils/format'
import type { Deal, DealStage } from '@/types'
import { BarChart3 } from 'lucide-react'

interface DealPipelineChartProps {
  deals: Deal[]
}

const STAGE_CONFIG: Record<DealStage, { label: string; color: string }> = {
  lead: { label: 'Lead', color: '#6b7280' },
  qualified: { label: 'Qualified', color: '#3b82f6' },
  proposal: { label: 'Proposal', color: '#eab308' },
  negotiation: { label: 'Negotiation', color: '#f97316' },
  closed_won: { label: 'Won', color: '#22c55e' },
  closed_lost: { label: 'Lost', color: '#ef4444' },
}

export function DealPipelineChart({ deals }: DealPipelineChartProps) {
  const chartData = useMemo(() => {
    // Group deals by stage
    const dealsByStage = deals.reduce((acc, deal) => {
      const stage = deal.stage as DealStage
      if (!acc[stage]) {
        acc[stage] = {
          count: 0,
          totalValue: 0,
        }
      }
      acc[stage].count++
      acc[stage].totalValue += deal.value
      return acc
    }, {} as Record<DealStage, { count: number; totalValue: number }>)

    // Create chart data with all stages
    const stages: DealStage[] = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']

    return stages.map(stage => {
      const stageData = dealsByStage[stage] || { count: 0, totalValue: 0 }
      const config = STAGE_CONFIG[stage]

      return {
        stage: config.label,
        value: stageData.totalValue,
        count: stageData.count,
        color: config.color,
      }
    })
  }, [deals])

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium mb-1">{data.stage}</p>
          <p className="text-sm">Value: {formatCurrency(data.value)}</p>
          <p className="text-sm text-muted-foreground">{data.count} deals</p>
        </div>
      )
    }
    return null
  }

  const totalValue = chartData.reduce((sum, stage) => sum + stage.value, 0)
  const totalCount = chartData.reduce((sum, stage) => sum + stage.count, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Pipeline by Stage
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-muted-foreground">Total Value</div>
            <div className="text-lg font-bold">{formatCurrency(totalValue)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Total Deals</div>
            <div className="text-lg font-bold">{totalCount}</div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="stage"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

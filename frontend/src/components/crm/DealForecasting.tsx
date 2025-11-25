import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/utils/format'
import type { Deal, DealStage } from '@/types'
import { cn } from '@/utils/cn'
import { TrendingUp, DollarSign, Target } from 'lucide-react'

interface DealForecastingProps {
  deals: Deal[]
}

const STAGE_CONFIG: Record<DealStage, { label: string; color: string; defaultProbability: number }> = {
  lead: { label: 'Lead', color: 'bg-gray-500', defaultProbability: 10 },
  qualified: { label: 'Qualified', color: 'bg-blue-500', defaultProbability: 25 },
  proposal: { label: 'Proposal', color: 'bg-yellow-500', defaultProbability: 50 },
  negotiation: { label: 'Negotiation', color: 'bg-orange-500', defaultProbability: 75 },
  closed_won: { label: 'Won', color: 'bg-green-500', defaultProbability: 100 },
  closed_lost: { label: 'Lost', color: 'bg-red-500', defaultProbability: 0 },
}

export function DealForecasting({ deals }: DealForecastingProps) {
  const forecastData = useMemo(() => {
    // Filter out closed deals for active pipeline
    const activeDeals = deals.filter(
      deal => deal.stage !== 'closed_won' && deal.stage !== 'closed_lost'
    )

    // Calculate totals
    const totalPipelineValue = activeDeals.reduce((sum, deal) => sum + deal.value, 0)

    // Calculate weighted forecast (value * probability)
    const weightedForecast = activeDeals.reduce((sum, deal) => {
      const probability = deal.probability !== undefined
        ? deal.probability
        : STAGE_CONFIG[deal.stage as DealStage]?.defaultProbability || 0
      return sum + (deal.value * probability / 100)
    }, 0)

    // Group by stage
    const byStage = activeDeals.reduce((acc, deal) => {
      const stage = deal.stage as DealStage
      if (!acc[stage]) {
        acc[stage] = {
          count: 0,
          totalValue: 0,
          weightedValue: 0,
        }
      }
      const probability = deal.probability !== undefined
        ? deal.probability
        : STAGE_CONFIG[stage]?.defaultProbability || 0

      acc[stage].count++
      acc[stage].totalValue += deal.value
      acc[stage].weightedValue += (deal.value * probability / 100)
      return acc
    }, {} as Record<DealStage, { count: number; totalValue: number; weightedValue: number }>)

    return {
      totalPipelineValue,
      weightedForecast,
      byStage,
      dealCount: activeDeals.length,
    }
  }, [deals])

  const stages: DealStage[] = ['lead', 'qualified', 'proposal', 'negotiation']

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Revenue Forecast
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <DollarSign className="h-4 w-4" />
              Total Pipeline
            </div>
            <div className="text-2xl font-bold">
              {formatCurrency(forecastData.totalPipelineValue)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {forecastData.dealCount} active deals
            </div>
          </div>

          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Target className="h-4 w-4" />
              Weighted Forecast
            </div>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(forecastData.weightedForecast)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Based on probabilities
            </div>
          </div>

          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <TrendingUp className="h-4 w-4" />
              Win Probability
            </div>
            <div className="text-2xl font-bold">
              {forecastData.totalPipelineValue > 0
                ? ((forecastData.weightedForecast / forecastData.totalPipelineValue) * 100).toFixed(1)
                : '0.0'}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Average across pipeline
            </div>
          </div>
        </div>

        {/* Stage Breakdown */}
        <div>
          <h4 className="font-medium mb-3">Forecast by Stage</h4>
          <div className="space-y-3">
            {stages.map((stage) => {
              const stageData = forecastData.byStage[stage]
              const stageConfig = STAGE_CONFIG[stage]

              if (!stageData || stageData.count === 0) {
                return null
              }

              const avgProbability = stageConfig.defaultProbability

              return (
                <div key={stage} className="p-3 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={cn('h-2 w-2 rounded-full', stageConfig.color)} />
                      <span className="font-medium text-sm">{stageConfig.label}</span>
                      <Badge variant="secondary" className="text-xs">
                        {stageData.count} deals
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {avgProbability}% avg probability
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <div className="text-xs text-muted-foreground">Total Value</div>
                      <div className="font-semibold">
                        {formatCurrency(stageData.totalValue)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Weighted Value</div>
                      <div className="font-semibold text-primary">
                        {formatCurrency(stageData.weightedValue)}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {forecastData.dealCount === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No active deals in the pipeline
          </div>
        )}
      </CardContent>
    </Card>
  )
}

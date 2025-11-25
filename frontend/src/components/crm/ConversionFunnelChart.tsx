import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Contact, Deal } from '@/types'

interface ConversionFunnelChartProps {
  contacts: Contact[]
  deals: Deal[]
}

const FUNNEL_STAGES = [
  { key: 'leads', label: 'Leads', color: '#3b82f6' },
  { key: 'qualified', label: 'Qualified', color: '#8b5cf6' },
  { key: 'proposal', label: 'Proposal', color: '#ec4899' },
  { key: 'negotiation', label: 'Negotiation', color: '#f59e0b' },
  { key: 'won', label: 'Won', color: '#10b981' },
]

export function ConversionFunnelChart({ contacts, deals }: ConversionFunnelChartProps) {
  const funnelData = useMemo(() => {
    const totalLeads = contacts.length
    const qualifiedDeals = deals.filter(d => d.stage !== 'lead').length
    const proposalDeals = deals.filter(d => ['proposal', 'negotiation', 'closed_won'].includes(d.stage)).length
    const negotiationDeals = deals.filter(d => ['negotiation', 'closed_won'].includes(d.stage)).length
    const wonDeals = deals.filter(d => d.stage === 'closed_won').length

    return [
      { stage: 'Leads', count: totalLeads, percentage: 100 },
      { stage: 'Qualified', count: qualifiedDeals, percentage: totalLeads ? (qualifiedDeals / totalLeads * 100) : 0 },
      { stage: 'Proposal', count: proposalDeals, percentage: totalLeads ? (proposalDeals / totalLeads * 100) : 0 },
      { stage: 'Negotiation', count: negotiationDeals, percentage: totalLeads ? (negotiationDeals / totalLeads * 100) : 0 },
      { stage: 'Won', count: wonDeals, percentage: totalLeads ? (wonDeals / totalLeads * 100) : 0 },
    ]
  }, [contacts, deals])

  const conversionRate = funnelData[0].count > 0
    ? ((funnelData[4].count / funnelData[0].count) * 100).toFixed(1)
    : '0.0'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversion Funnel</CardTitle>
        <CardDescription>
          Lead to customer conversion rate: {conversionRate}%
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={funnelData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="stage" type="category" width={100} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null
                const data = payload[0].payload
                return (
                  <div className="bg-background border rounded-lg shadow-lg p-3">
                    <p className="font-medium">{data.stage}</p>
                    <p className="text-sm text-muted-foreground">
                      {data.count} ({data.percentage.toFixed(1)}%)
                    </p>
                  </div>
                )
              }}
            />
            <Bar dataKey="count" radius={[0, 8, 8, 0]}>
              {funnelData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={FUNNEL_STAGES[index].color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Leads</p>
            <p className="text-2xl font-bold">{funnelData[0].count}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Customers Won</p>
            <p className="text-2xl font-bold text-green-600">{funnelData[4].count}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

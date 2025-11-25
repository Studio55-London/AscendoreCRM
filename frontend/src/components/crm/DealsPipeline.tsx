import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/utils/format'
import type { Deal, DealStage } from '@/types'
import { cn } from '@/utils/cn'
import { Edit2, Trash2, MoreVertical, GripVertical } from 'lucide-react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { useSortable } from '@dnd-kit/sortable'

interface DealsPipelineProps {
  deals: Deal[]
  loading: boolean
  onEdit?: (deal: Deal) => void
  onDelete?: (deal: Deal) => void
  onStageChange?: (dealId: string, newStage: DealStage) => void
}

const STAGE_CONFIG: Record<DealStage, { label: string; color: string }> = {
  lead: { label: 'Lead', color: 'bg-gray-500' },
  qualified: { label: 'Qualified', color: 'bg-blue-500' },
  proposal: { label: 'Proposal', color: 'bg-yellow-500' },
  negotiation: { label: 'Negotiation', color: 'bg-orange-500' },
  closed_won: { label: 'Won', color: 'bg-green-500' },
  closed_lost: { label: 'Lost', color: 'bg-red-500' },
}

interface DraggableDealCardProps {
  deal: Deal
  onEdit?: (deal: Deal) => void
  onDelete?: (deal: Deal) => void
}

function DraggableDealCard({ deal, onEdit, onDelete }: DraggableDealCardProps) {
  const [openMenu, setOpenMenu] = useState(false)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-3 rounded-lg border bg-card hover:bg-accent transition-colors cursor-move relative group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <span className="font-medium">{deal.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-primary">
            {formatCurrency(deal.value)}
          </span>
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation()
                setOpenMenu(!openMenu)
              }}
            >
              <MoreVertical className="h-3 w-3" />
            </Button>
            {openMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setOpenMenu(false)}
                />
                <div className="absolute right-0 mt-1 w-40 bg-background border rounded-md shadow-lg z-20">
                  <button
                    className="w-full px-3 py-2 text-left text-xs hover:bg-accent flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit?.(deal)
                      setOpenMenu(false)
                    }}
                  >
                    <Edit2 className="h-3 w-3" />
                    Edit Deal
                  </button>
                  <button
                    className="w-full px-3 py-2 text-left text-xs hover:bg-accent text-destructive flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete?.(deal)
                      setOpenMenu(false)
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete Deal
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-1 text-sm text-muted-foreground">
        <span>{deal.company?.name || deal.contact?.name}</span>
        {deal.expectedCloseDate && (
          <span>Close: {formatDate(deal.expectedCloseDate)}</span>
        )}
      </div>
    </div>
  )
}

export function DealsPipeline({ deals, loading, onEdit, onDelete, onStageChange }: DealsPipelineProps) {
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Deals Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const dealsByStage = deals.reduce((acc, deal) => {
    const stage = deal.stage as DealStage
    if (!acc[stage]) acc[stage] = []
    acc[stage].push(deal)
    return acc
  }, {} as Record<DealStage, Deal[]>)

  const stages: DealStage[] = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won']

  const handleDragStart = (event: DragStartEvent) => {
    const deal = deals.find(d => d.id === event.active.id)
    setActiveDeal(deal || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || !onStageChange) {
      setActiveDeal(null)
      return
    }

    const dealId = active.id as string
    const newStage = over.id as DealStage

    // Only update if the stage actually changed
    const deal = deals.find(d => d.id === dealId)
    if (deal && deal.stage !== newStage) {
      onStageChange(dealId, newStage)
    }

    setActiveDeal(null)
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Card>
        <CardHeader>
          <CardTitle>Deals Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {stages.map((stage) => {
              const stageDeals = dealsByStage[stage] || []
              const stageConfig = STAGE_CONFIG[stage]
              const stageValue = stageDeals.reduce((sum, deal) => sum + deal.value, 0)

              return (
                <div key={stage}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className={cn('h-2 w-2 rounded-full', stageConfig.color)} />
                      <h4 className="font-medium">{stageConfig.label}</h4>
                      <Badge variant="secondary">{stageDeals.length}</Badge>
                    </div>
                    <span className="text-sm font-medium">{formatCurrency(stageValue)}</span>
                  </div>
                  <div
                    data-stage={stage}
                    className="space-y-2 min-h-[80px] p-2 rounded-lg border-2 border-dashed border-transparent transition-colors"
                    style={{
                      borderColor: activeDeal && activeDeal.stage !== stage ? 'hsl(var(--primary))' : 'transparent',
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (activeDeal && onStageChange) {
                        onStageChange(activeDeal.id, stage)
                      }
                    }}
                  >
                    {stageDeals.slice(0, 3).map((deal) => (
                      <DraggableDealCard
                        key={deal.id}
                        deal={deal}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    ))}
                    {stageDeals.length > 3 && (
                      <div className="text-center text-sm text-muted-foreground py-2">
                        +{stageDeals.length - 3} more deals
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
      <DragOverlay>
        {activeDeal ? (
          <div className="p-3 rounded-lg border bg-card shadow-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium">{activeDeal.title}</span>
              <span className="font-semibold text-primary">
                {formatCurrency(activeDeal.value)}
              </span>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

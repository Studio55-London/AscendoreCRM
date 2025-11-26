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
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  closestCenter,
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

const STAGE_CONFIG: Record<DealStage, { label: string; color: string; bgColor: string }> = {
  lead: { label: 'Lead', color: 'bg-gray-500', bgColor: 'bg-gray-50' },
  qualified: { label: 'Qualified', color: 'bg-blue-500', bgColor: 'bg-blue-50' },
  proposal: { label: 'Proposal', color: 'bg-yellow-500', bgColor: 'bg-yellow-50' },
  negotiation: { label: 'Negotiation', color: 'bg-orange-500', bgColor: 'bg-orange-50' },
  closed_won: { label: 'Won', color: 'bg-green-500', bgColor: 'bg-green-50' },
  closed_lost: { label: 'Lost', color: 'bg-red-500', bgColor: 'bg-red-50' },
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
      className={cn(
        "p-3 rounded-lg border bg-card hover:bg-accent transition-colors cursor-move relative group",
        isDragging && "shadow-lg ring-2 ring-primary"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <span className="font-medium truncate">{deal.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-primary whitespace-nowrap">
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
      <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
        <span className="truncate">{deal.company?.name || deal.contact?.name || 'No contact'}</span>
        {deal.expectedCloseDate && (
          <span className="whitespace-nowrap text-xs">Close: {formatDate(deal.expectedCloseDate)}</span>
        )}
      </div>
      {deal.probability > 0 && (
        <div className="mt-2">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Probability</span>
            <span>{deal.probability}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${deal.probability}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

interface StageColumnProps {
  stage: DealStage
  deals: Deal[]
  isOver: boolean
  onEdit?: (deal: Deal) => void
  onDelete?: (deal: Deal) => void
}

function StageColumn({ stage, deals, isOver, onEdit, onDelete }: StageColumnProps) {
  const { setNodeRef } = useDroppable({
    id: stage,
  })

  const stageConfig = STAGE_CONFIG[stage]
  const stageValue = deals.reduce((sum, deal) => sum + deal.value, 0)

  return (
    <div className="flex-1 min-w-[280px]">
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2">
          <div className={cn('h-3 w-3 rounded-full', stageConfig.color)} />
          <h4 className="font-semibold">{stageConfig.label}</h4>
          <Badge variant="secondary" className="rounded-full">{deals.length}</Badge>
        </div>
        <span className="text-sm font-medium text-muted-foreground">{formatCurrency(stageValue)}</span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "space-y-2 min-h-[400px] p-3 rounded-lg border-2 transition-colors",
          isOver ? "border-primary bg-primary/5" : "border-dashed border-border",
          stageConfig.bgColor
        )}
      >
        {deals.map((deal) => (
          <DraggableDealCard
            key={deal.id}
            deal={deal}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
        {deals.length === 0 && (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
            Drop deals here
          </div>
        )}
      </div>
    </div>
  )
}

export function DealsPipeline({ deals, loading, onEdit, onDelete, onStageChange }: DealsPipelineProps) {
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null)
  const [activeOverStage, setActiveOverStage] = useState<DealStage | null>(null)

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
          <div className="flex gap-4 overflow-x-auto pb-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex-1 min-w-[280px]">
                <div className="h-8 bg-muted animate-pulse rounded mb-3" />
                <div className="space-y-2">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-24 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              </div>
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

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event
    if (over) {
      const stageId = over.id as DealStage
      if (stages.includes(stageId)) {
        setActiveOverStage(stageId)
      }
    } else {
      setActiveOverStage(null)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    setActiveDeal(null)
    setActiveOverStage(null)

    if (!over || !onStageChange) {
      return
    }

    const dealId = active.id as string
    const newStage = over.id as DealStage

    // Only update if it's a valid stage and the stage actually changed
    if (stages.includes(newStage)) {
      const deal = deals.find(d => d.id === dealId)
      if (deal && deal.stage !== newStage) {
        onStageChange(dealId, newStage)
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Deals Pipeline</span>
            <span className="text-sm font-normal text-muted-foreground">
              {deals.length} deals • {formatCurrency(deals.reduce((sum, d) => sum + d.value, 0))} total value
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {stages.map((stage) => (
              <StageColumn
                key={stage}
                stage={stage}
                deals={dealsByStage[stage] || []}
                isOver={activeOverStage === stage}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </CardContent>
      </Card>
      <DragOverlay>
        {activeDeal ? (
          <div className="p-3 rounded-lg border bg-card shadow-xl opacity-90">
            <div className="flex items-center justify-between">
              <span className="font-medium">{activeDeal.title}</span>
              <span className="font-semibold text-primary">
                {formatCurrency(activeDeal.value)}
              </span>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {activeDeal.company?.name || activeDeal.contact?.name || 'No contact'}
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

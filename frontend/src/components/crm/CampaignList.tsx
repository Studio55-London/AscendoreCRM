import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Target, Calendar, TrendingUp, MoreVertical, Edit2, Trash2, Users } from 'lucide-react'
import { getInitials, formatRelativeTime } from '@/utils/format'
import { format } from 'date-fns'
import type { Campaign } from '@/types'

interface CampaignListProps {
  campaigns: Campaign[]
  loading: boolean
  onCampaignClick?: (campaign: Campaign) => void
  onEdit?: (campaign: Campaign) => void
  onDelete?: (campaign: Campaign) => void
}

const STATUS_COLORS: Record<Campaign['status'], string> = {
  draft: 'bg-gray-500',
  active: 'bg-green-500',
  paused: 'bg-yellow-500',
  completed: 'bg-blue-500',
  archived: 'bg-gray-400',
}

const STATUS_LABELS: Record<Campaign['status'], string> = {
  draft: 'Draft',
  active: 'Active',
  paused: 'Paused',
  completed: 'Completed',
  archived: 'Archived',
}

export function CampaignList({ campaigns, loading, onCampaignClick, onEdit, onDelete }: CampaignListProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-48 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (campaigns.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No campaigns found</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaigns</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
              onClick={() => onCampaignClick?.(campaign)}
            >
              <div className="flex items-center space-x-4 flex-1">
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(campaign.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-medium">{campaign.name}</div>
                    <Badge variant="outline" className={`${STATUS_COLORS[campaign.status]} text-white border-0`}>
                      {STATUS_LABELS[campaign.status]}
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                    {campaign.startDate && campaign.endDate && (
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {format(new Date(campaign.startDate), 'MMM d')} - {format(new Date(campaign.endDate), 'MMM d, yyyy')}
                      </span>
                    )}
                    {campaign.contactIds && campaign.contactIds.length > 0 && (
                      <span className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {campaign.contactIds.length} contacts
                      </span>
                    )}
                    {campaign.goalType && campaign.goalValue && (
                      <span className="flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Goal: {campaign.goalValue} {campaign.goalType}
                      </span>
                    )}
                  </div>

                  {campaign.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                      {campaign.description}
                    </p>
                  )}

                  {campaign.goalValue && campaign.currentProgress !== undefined && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Progress</span>
                        <span>{Math.round((campaign.currentProgress / campaign.goalValue) * 100)}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${Math.min((campaign.currentProgress / campaign.goalValue) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {campaign.tags && campaign.tags.length > 0 && (
                  <div className="flex space-x-1">
                    {campaign.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      setOpenMenuId(openMenuId === campaign.id ? null : campaign.id)
                    }}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                  {openMenuId === campaign.id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setOpenMenuId(null)}
                      />
                      <div className="absolute right-0 mt-1 w-48 bg-background border rounded-md shadow-lg z-20">
                        <button
                          className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-2"
                          onClick={(e) => {
                            e.stopPropagation()
                            onEdit?.(campaign)
                            setOpenMenuId(null)
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                          Edit Campaign
                        </button>
                        <button
                          className="w-full px-4 py-2 text-left text-sm hover:bg-accent text-destructive flex items-center gap-2"
                          onClick={(e) => {
                            e.stopPropagation()
                            onDelete?.(campaign)
                            setOpenMenuId(null)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Campaign
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Target, Calendar, TrendingUp, Users, Activity as ActivityIcon,
  Mail, X, UserPlus, Filter
} from 'lucide-react'
import { format } from 'date-fns'
import { getInitials } from '@/utils/format'
import type { CampaignWithDetails, Contact } from '@/types'
import { ContactFilterDialog } from './ContactFilterDialog'

interface CampaignDetailProps {
  campaign: CampaignWithDetails
  onAddContacts?: (contactIds: string[]) => Promise<void>
  onRemoveContact?: (contactId: string) => Promise<void>
  onAddContactsByFilter?: (filter: any) => Promise<{ added: number }>
  onRefresh?: () => void
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-500',
  active: 'bg-green-500',
  paused: 'bg-yellow-500',
  completed: 'bg-blue-500',
  archived: 'bg-gray-400',
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  active: 'Active',
  paused: 'Paused',
  completed: 'Completed',
  archived: 'Archived',
}

export function CampaignDetail({
  campaign,
  onRemoveContact,
  onAddContactsByFilter,
  onRefresh
}: CampaignDetailProps) {
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)

  const progressPercentage = campaign.goalValue && campaign.currentProgress !== undefined
    ? Math.round((campaign.currentProgress / campaign.goalValue) * 100)
    : 0

  const handleApplyFilter = async (filter: any) => {
    if (onAddContactsByFilter) {
      const result = await onAddContactsByFilter(filter)
      onRefresh?.()
      return result
    }
    return { added: 0 }
  }

  return (
    <>
      <div className="space-y-6">
        {/* Campaign Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-2xl">{campaign.name}</CardTitle>
                  <Badge
                    variant="outline"
                    className={`${STATUS_COLORS[campaign.status]} text-white border-0`}
                  >
                    {STATUS_LABELS[campaign.status]}
                  </Badge>
                </div>
                {campaign.description && (
                  <CardDescription className="text-base">{campaign.description}</CardDescription>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {campaign.startDate && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Start Date</div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(campaign.startDate), 'MMM d, yyyy')}
                  </div>
                </div>
              )}
              {campaign.endDate && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">End Date</div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(campaign.endDate), 'MMM d, yyyy')}
                  </div>
                </div>
              )}
              <div>
                <div className="text-sm text-muted-foreground mb-1">Contacts</div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {campaign.contacts?.length || 0}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Activities</div>
                <div className="flex items-center gap-2">
                  <ActivityIcon className="h-4 w-4" />
                  {campaign.activities?.length || 0}
                </div>
              </div>
            </div>

            {campaign.goalType && campaign.goalValue && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Target className="h-4 w-4" />
                    Campaign Goal: {campaign.goalValue} {campaign.goalType}
                  </div>
                  <span className="text-sm text-muted-foreground">{progressPercentage}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {campaign.tags && campaign.tags.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {campaign.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contacts Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Campaign Contacts</CardTitle>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setFilterDialogOpen(true)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Add by Filter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!campaign.contacts || campaign.contacts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No contacts in this campaign yet</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setFilterDialogOpen(true)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Contacts
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {campaign.contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {getInitials(contact.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{contact.name}</div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          {contact.email && (
                            <span className="flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {contact.email}
                            </span>
                          )}
                          {contact.company && (
                            <span>{contact.company}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {onRemoveContact && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveContact(contact.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activities Section */}
        {campaign.activities && campaign.activities.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Campaign Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {campaign.activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="p-3 rounded-lg border"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">{activity.title}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {activity.description}
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          Type: {activity.type} • Created: {format(new Date(activity.createdAt), 'MMM d, yyyy')}
                        </div>
                      </div>
                      {activity.completed && (
                        <Badge variant="outline" className="bg-green-500 text-white border-0">
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <ContactFilterDialog
        open={filterDialogOpen}
        onOpenChange={setFilterDialogOpen}
        onApplyFilter={handleApplyFilter}
      />
    </>
  )
}

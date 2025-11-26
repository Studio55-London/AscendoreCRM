import { useMemo } from 'react'
import { Eye, Plus, Edit, Trash2, User, Building2, DollarSign, FileText, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDistanceToNow } from 'date-fns'

// API returns activities with this structure
interface ApiActivity {
  id: string
  company_id: string
  activity_type: string  // "viewed", "created", "updated", "deleted"
  entity_type: string    // "contact", "deal", "company", etc.
  entity_id: string
  description: string
  user_id: string
  metadata: Record<string, any>
  created_at: string
  user_email?: string
  user_name?: string
}

interface ActivityTimelineProps {
  activities: ApiActivity[]
  loading?: boolean
}

// Map activity types to icons
const activityTypeIcons: Record<string, typeof Eye> = {
  viewed: Eye,
  created: Plus,
  updated: Edit,
  deleted: Trash2,
}

// Map entity types to icons
const entityTypeIcons: Record<string, typeof User> = {
  contact: User,
  company: Building2,
  deal: DollarSign,
  note: FileText,
}

// Map activity types to colors
const activityColors: Record<string, string> = {
  viewed: 'text-blue-500',
  created: 'text-green-500',
  updated: 'text-orange-500',
  deleted: 'text-red-500',
}

export function ActivityTimeline({ activities, loading }: ActivityTimelineProps) {
  const sortedActivities = useMemo(() => {
    if (!activities || !Array.isArray(activities)) return []
    return [...activities].sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
      return dateB - dateA
    })
  }, [activities])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
          <CardDescription>Recent activities and interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (sortedActivities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
          <CardDescription>Recent activities and interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No activities yet</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Timeline</CardTitle>
        <CardDescription>Recent activities and interactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-4">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

          {sortedActivities.map((activity) => {
            // Get the appropriate icon - fallback to Eye if not found
            const Icon = activityTypeIcons[activity.activity_type] || entityTypeIcons[activity.entity_type] || Eye
            const colorClass = activityColors[activity.activity_type] || 'text-gray-500'

            // Safely format the date
            let timeAgo = 'Unknown time'
            try {
              if (activity.created_at) {
                const date = new Date(activity.created_at)
                if (!isNaN(date.getTime())) {
                  timeAgo = formatDistanceToNow(date, { addSuffix: true })
                }
              }
            } catch {
              timeAgo = 'Unknown time'
            }

            return (
              <div key={activity.id} className="relative pl-10 pb-4">
                {/* Activity icon */}
                <div className="absolute left-0 top-0 flex items-center justify-center w-8 h-8 rounded-full bg-background border-2 border-border">
                  <Icon className={`h-4 w-4 ${colorClass}`} />
                </div>

                {/* Activity content */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium capitalize">
                        {activity.activity_type} {activity.entity_type}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <span className="capitalize">{activity.entity_type}</span>
                        <span>•</span>
                        <span>{timeAgo}</span>
                      </div>
                    </div>
                    {activity.user_name && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        <User className="h-3 w-3" />
                        {activity.user_name}
                      </div>
                    )}
                  </div>

                  {activity.description && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {activity.description}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

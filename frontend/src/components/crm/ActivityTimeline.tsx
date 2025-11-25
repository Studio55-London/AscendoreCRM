import { useMemo } from 'react'
import { Phone, Mail, Calendar, CheckSquare, FileText, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Activity } from '@/types'
import { formatDistanceToNow } from 'date-fns'

interface ActivityTimelineProps {
  activities: Activity[]
  loading?: boolean
}

const activityIcons = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  task: CheckSquare,
  note: FileText,
}

const activityColors = {
  call: 'text-blue-500',
  email: 'text-purple-500',
  meeting: 'text-green-500',
  task: 'text-orange-500',
  note: 'text-gray-500',
}

export function ActivityTimeline({ activities, loading }: ActivityTimelineProps) {
  const sortedActivities = useMemo(() => {
    return [...activities].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
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

          {sortedActivities.map((activity, index) => {
            const Icon = activityIcons[activity.type]
            const colorClass = activityColors[activity.type]

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
                      <h4 className="font-medium">{activity.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <span className="capitalize">{activity.type}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                    {activity.completed && (
                      <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                        <CheckSquare className="h-3 w-3" />
                        Completed
                      </div>
                    )}
                  </div>

                  {activity.description && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {activity.description}
                    </p>
                  )}

                  {activity.dueDate && !activity.completed && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                      <Clock className="h-3 w-3" />
                      Due {formatDistanceToNow(new Date(activity.dueDate), { addSuffix: true })}
                    </div>
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

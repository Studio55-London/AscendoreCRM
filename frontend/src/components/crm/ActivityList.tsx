import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Circle, Calendar, MessageSquare, Phone, Mail, FileText, Edit2, Trash2, MoreVertical, Eye, Plus, Pencil, Activity as ActivityIcon } from 'lucide-react'
import { formatDateTime, formatRelativeTime } from '@/utils/format'
import type { Activity } from '@/types'
import { cn } from '@/utils/cn'

interface ActivityListProps {
  activities: Activity[]
  loading: boolean
  onEdit?: (activity: Activity) => void
  onDelete?: (activity: Activity) => void
}

const ACTIVITY_ICONS: Record<string, typeof Phone> = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  task: CheckCircle2,
  note: FileText,
  // Activity log types from backend
  viewed: Eye,
  created: Plus,
  updated: Pencil,
  deleted: Trash2,
}

const ACTIVITY_COLORS: Record<string, string> = {
  call: 'text-blue-500',
  email: 'text-purple-500',
  meeting: 'text-green-500',
  task: 'text-orange-500',
  note: 'text-gray-500',
  // Activity log types from backend
  viewed: 'text-blue-400',
  created: 'text-green-500',
  updated: 'text-yellow-500',
  deleted: 'text-red-500',
}

export function ActivityList({ activities, loading, onEdit, onDelete }: ActivityListProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex space-x-4">
                <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground">No activities found</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-4">
          {/* Timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

          {activities.map((activity, index) => {
            const Icon = ACTIVITY_ICONS[activity.type] || ActivityIcon
            const color = ACTIVITY_COLORS[activity.type] || 'text-gray-500'

            return (
              <div key={activity.id} className="relative flex gap-4">
                {/* Timeline dot */}
                <div className={cn(
                  'relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-background border-2',
                  activity.completed ? 'border-green-500' : 'border-border'
                )}>
                  <Icon className={cn('h-5 w-5', color)} />
                </div>

                {/* Content */}
                <div className="flex-1 pb-8">
                  <div className="rounded-lg border bg-card p-4 hover:bg-accent transition-colors group relative">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{activity.title}</h4>
                          <Badge variant={activity.completed ? 'default' : 'secondary'}>
                            {activity.type}
                          </Badge>
                          {activity.completed && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Completed
                            </Badge>
                          )}
                        </div>
                        {activity.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {activity.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatRelativeTime(activity.createdAt)}
                        </span>
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation()
                              setOpenMenuId(openMenuId === activity.id ? null : activity.id)
                            }}
                          >
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                          {openMenuId === activity.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setOpenMenuId(null)}
                              />
                              <div className="absolute right-0 mt-1 w-44 bg-background border rounded-md shadow-lg z-20">
                                <button
                                  className="w-full px-3 py-2 text-left text-xs hover:bg-accent flex items-center gap-2"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onEdit?.(activity)
                                    setOpenMenuId(null)
                                  }}
                                >
                                  <Edit2 className="h-3 w-3" />
                                  Edit Activity
                                </button>
                                <button
                                  className="w-full px-3 py-2 text-left text-xs hover:bg-accent text-destructive flex items-center gap-2"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onDelete?.(activity)
                                    setOpenMenuId(null)
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                  Delete Activity
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {activity.dueDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDateTime(activity.dueDate)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

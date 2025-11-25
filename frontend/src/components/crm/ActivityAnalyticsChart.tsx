import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Activity } from '@/types'
import { format, subDays, startOfDay } from 'date-fns'

interface ActivityAnalyticsChartProps {
  activities: Activity[]
}

export function ActivityAnalyticsChart({ activities }: ActivityAnalyticsChartProps) {
  const chartData = useMemo(() => {
    // Get last 7 days
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = startOfDay(subDays(new Date(), 6 - i))
      return {
        date,
        dateStr: format(date, 'MMM dd'),
        calls: 0,
        emails: 0,
        meetings: 0,
        tasks: 0,
        notes: 0,
      }
    })

    // Count activities by type and date
    activities.forEach(activity => {
      const activityDate = startOfDay(new Date(activity.createdAt))
      const dayData = days.find(d => d.date.getTime() === activityDate.getTime())

      if (dayData) {
        switch (activity.type) {
          case 'call':
            dayData.calls++
            break
          case 'email':
            dayData.emails++
            break
          case 'meeting':
            dayData.meetings++
            break
          case 'task':
            dayData.tasks++
            break
          case 'note':
            dayData.notes++
            break
        }
      }
    })

    return days.map(({ dateStr, calls, emails, meetings, tasks, notes }) => ({
      date: dateStr,
      Calls: calls,
      Emails: emails,
      Meetings: meetings,
      Tasks: tasks,
      Notes: notes,
    }))
  }, [activities])

  const totals = useMemo(() => {
    return activities.reduce((acc, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }, [activities])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Analytics</CardTitle>
        <CardDescription>Activity breakdown for the last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Calls" fill="#3b82f6" stackId="a" />
            <Bar dataKey="Emails" fill="#8b5cf6" stackId="a" />
            <Bar dataKey="Meetings" fill="#10b981" stackId="a" />
            <Bar dataKey="Tasks" fill="#f59e0b" stackId="a" />
            <Bar dataKey="Notes" fill="#6b7280" stackId="a" />
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-4 grid grid-cols-5 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Calls</p>
            <p className="text-xl font-bold text-blue-600">{totals.call || 0}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Emails</p>
            <p className="text-xl font-bold text-purple-600">{totals.email || 0}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Meetings</p>
            <p className="text-xl font-bold text-green-600">{totals.meeting || 0}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Tasks</p>
            <p className="text-xl font-bold text-orange-600">{totals.task || 0}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Notes</p>
            <p className="text-xl font-bold text-gray-600">{totals.note || 0}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

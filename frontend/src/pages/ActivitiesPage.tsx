import { useEffect, useState, useMemo } from 'react'
import { Plus, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SearchInput } from '@/components/ui/search-input'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Pagination } from '@/components/ui/pagination'
import { ActivityList } from '@/components/crm/ActivityList'
import { ActivityDialog } from '@/components/crm/ActivityDialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/toast'
import { api } from '@/services/api'
import type { Activity, Contact, Company, Deal } from '@/types'
import { FloatingChat } from '@/components/chat/FloatingChat'
import { exportActivities } from '@/utils/export'

export function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [activityToDelete, setActivityToDelete] = useState<Activity | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { addToast } = useToast()

  // Filter activities based on search query and date range
  const filteredActivities = useMemo(() => {
    let result = activities

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(activity =>
        activity.title?.toLowerCase().includes(query) ||
        activity.description?.toLowerCase().includes(query) ||
        activity.type?.toLowerCase().includes(query)
      )
    }

    // Apply date range filter
    if (dateRange.from || dateRange.to) {
      result = result.filter(activity => {
        if (!activity.createdAt) return false
        const activityDate = new Date(activity.createdAt)
        if (dateRange.from && activityDate < dateRange.from) return false
        if (dateRange.to && activityDate > dateRange.to) return false
        return true
      })
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      result = result.filter(activity =>
        activity.tags?.some(tag => selectedTags.includes(tag))
      )
    }

    return result
  }, [activities, searchQuery, dateRange, selectedTags])

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    activities.forEach(activity => {
      activity.tags?.forEach(tag => tags.add(tag))
    })
    return Array.from(tags).sort()
  }, [activities])

  const fetchActivities = async (page = 1) => {
    try {
      setLoading(true)
      const ITEMS_PER_PAGE = 20
      const response = await api.getActivities({
        limit: ITEMS_PER_PAGE,
        offset: (page - 1) * ITEMS_PER_PAGE
      })
      setActivities(response.data)
      setTotalPages(response.totalPages)
      setCurrentPage(page)
    } catch (error) {
      console.error('Failed to fetch activities:', error)
      addToast({
        title: 'Error',
        description: 'Failed to load activities',
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchContacts = async () => {
    try {
      const response = await api.getContacts({ limit: 100 })
      setContacts(response.data)
    } catch (error) {
      console.error('Failed to fetch contacts:', error)
    }
  }

  const fetchCompanies = async () => {
    try {
      const response = await api.getCompanies({ limit: 100 })
      setCompanies(response.data)
    } catch (error) {
      console.error('Failed to fetch companies:', error)
    }
  }

  const fetchDeals = async () => {
    try {
      const response = await api.getDeals({ limit: 100 })
      setDeals(response.data)
    } catch (error) {
      console.error('Failed to fetch deals:', error)
    }
  }

  useEffect(() => {
    fetchActivities(1)
    fetchContacts()
    fetchCompanies()
    fetchDeals()
  }, [])

  const handleAddActivity = () => {
    setSelectedActivity(null)
    setDialogOpen(true)
  }

  const handleEditActivity = (activity: Activity) => {
    setSelectedActivity(activity)
    setDialogOpen(true)
  }

  const handleSaveActivity = async (data: Partial<Activity>) => {
    try {
      if (selectedActivity) {
        await api.updateActivity(selectedActivity.id, data)
        addToast({
          title: 'Success',
          description: 'Activity updated successfully',
          variant: 'success',
        })
      } else {
        await api.createActivity(data)
        addToast({
          title: 'Success',
          description: 'Activity created successfully',
          variant: 'success',
        })
      }
      await fetchActivities()
      setDialogOpen(false)
    } catch (error: any) {
      console.error('Failed to save activity:', error)
      addToast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save activity',
        variant: 'error',
      })
      throw error
    }
  }

  const handleDeleteClick = (activity: Activity) => {
    setActivityToDelete(activity)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!activityToDelete) return

    try {
      setDeleteLoading(true)
      await api.deleteActivity(activityToDelete.id)
      addToast({
        title: 'Success',
        description: 'Activity deleted successfully',
        variant: 'success',
      })
      await fetchActivities()
      setDeleteConfirmOpen(false)
      setActivityToDelete(null)
    } catch (error) {
      console.error('Failed to delete activity:', error)
      addToast({
        title: 'Error',
        description: 'Failed to delete activity',
        variant: 'error',
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activities</h1>
          <p className="text-muted-foreground">Track all your CRM activities</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => exportActivities(filteredActivities)}
            disabled={filteredActivities.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={handleAddActivity}>
            <Plus className="mr-2 h-4 w-4" />
            Add Activity
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search activities by title, description, or type..."
          className="max-w-md flex-1"
        />
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
          className="w-64"
        />
      </div>

      {allTags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Filter by tags:</span>
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => {
                setSelectedTags(prev =>
                  prev.includes(tag)
                    ? prev.filter(t => t !== tag)
                    : [...prev, tag]
                )
              }}
            >
              {tag}
            </Badge>
          ))}
          {selectedTags.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedTags([])}
            >
              Clear filters
            </Button>
          )}
        </div>
      )}

      <ActivityList
        activities={filteredActivities}
        loading={loading}
        onEdit={handleEditActivity}
        onDelete={handleDeleteClick}
      />

      <ActivityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        activity={selectedActivity}
        contacts={contacts}
        companies={companies}
        deals={deals}
        onSave={handleSaveActivity}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Activity"
        description={`Are you sure you want to delete "${activityToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={fetchActivities}
      />

      <FloatingChat />
    </div>
  )
}

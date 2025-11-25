import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TagInput } from '@/components/ui/tag-input'
import type { Activity, Contact, Company, Deal } from '@/types'

interface ActivityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  activity?: Activity | null
  contacts?: Contact[]
  companies?: Company[]
  deals?: Deal[]
  onSave: (data: Partial<Activity>) => Promise<void>
}

const ACTIVITY_TYPES = [
  { value: 'call', label: 'Call' },
  { value: 'email', label: 'Email' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'task', label: 'Task' },
  { value: 'note', label: 'Note' },
]

export function ActivityDialog({ open, onOpenChange, activity, contacts = [], companies = [], deals = [], onSave }: ActivityDialogProps) {
  const [formData, setFormData] = useState({
    type: 'call' as Activity['type'],
    title: '',
    description: '',
    dueDate: '',
    contactId: '',
    companyId: '',
    dealId: '',
    tags: [] as string[],
    completed: false,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (activity) {
      setFormData({
        type: activity.type || 'call',
        title: activity.title || '',
        description: activity.description || '',
        dueDate: activity.dueDate ? activity.dueDate.split('T')[0] : '',
        contactId: activity.contactId || '',
        companyId: activity.companyId || '',
        dealId: activity.dealId || '',
        tags: activity.tags || [],
        completed: activity.completed || false,
      })
    } else {
      setFormData({
        type: 'call',
        title: '',
        description: '',
        dueDate: '',
        contactId: '',
        companyId: '',
        dealId: '',
        tags: [],
        completed: false,
      })
    }
  }, [activity, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onSave({
        type: formData.type,
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate || undefined,
        contactId: formData.contactId || undefined,
        companyId: formData.companyId || undefined,
        dealId: formData.dealId || undefined,
        tags: formData.tags,
        completed: formData.completed,
      })
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save activity:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>{activity ? 'Edit Activity' : 'Add New Activity'}</DialogTitle>
          <DialogDescription>
            {activity ? 'Update activity details' : 'Create a new activity to track'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Activity Type *</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-input bg-background"
                required
              >
                {ACTIVITY_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
              placeholder="Follow-up call with prospect"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Additional details about this activity..."
              className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactId">Related Contact</Label>
              <select
                id="contactId"
                value={formData.contactId}
                onChange={(e) => handleChange('contactId', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
              >
                <option value="">None</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyId">Related Company</Label>
              <select
                id="companyId"
                value={formData.companyId}
                onChange={(e) => handleChange('companyId', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
              >
                <option value="">None</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dealId">Related Deal</Label>
              <select
                id="dealId"
                value={formData.dealId}
                onChange={(e) => handleChange('dealId', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
              >
                <option value="">None</option>
                {deals.map((deal) => (
                  <option key={deal.id} value={deal.id}>
                    {deal.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <TagInput
              tags={formData.tags}
              onChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
              placeholder="Add tags (e.g., urgent, follow-up)..."
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="completed"
              checked={formData.completed}
              onChange={(e) => handleChange('completed', e.target.checked)}
              className="w-4 h-4 rounded border-input"
            />
            <Label htmlFor="completed" className="cursor-pointer">
              Mark as completed
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : activity ? 'Update Activity' : 'Create Activity'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

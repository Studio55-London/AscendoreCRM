import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Campaign } from '@/types'

interface CampaignDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaign?: Campaign | null
  onSave: (data: Partial<Campaign>) => Promise<void>
}

const STATUSES: { value: Campaign['status']; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
]

const GOAL_TYPES: { value: Campaign['goalType']; label: string }[] = [
  { value: 'revenue', label: 'Revenue' },
  { value: 'deals', label: 'Deals' },
  { value: 'contacts', label: 'Contacts' },
  { value: 'activities', label: 'Activities' },
]

const CAMPAIGN_TYPES = [
  { value: 'email', label: 'Email' },
  { value: 'social', label: 'Social Media' },
  { value: 'webinar', label: 'Webinar' },
  { value: 'event', label: 'Event' },
  { value: 'content', label: 'Content Marketing' },
  { value: 'advertising', label: 'Advertising' },
  { value: 'other', label: 'Other' },
]

export function CampaignDialog({ open, onOpenChange, campaign, onSave }: CampaignDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    campaignType: 'email',
    status: 'draft' as Campaign['status'],
    startDate: '',
    endDate: '',
    goalType: '' as Campaign['goalType'] | '',
    goalValue: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (campaign) {
      setFormData({
        name: campaign.name || '',
        description: campaign.description || '',
        campaignType: (campaign as any).campaign_type || 'email',
        status: campaign.status || 'draft',
        startDate: campaign.startDate ? campaign.startDate.split('T')[0] : '',
        endDate: campaign.endDate ? campaign.endDate.split('T')[0] : '',
        goalType: campaign.goalType || '',
        goalValue: campaign.goalValue?.toString() || '',
        notes: campaign.notes || '',
      })
    } else {
      setFormData({
        name: '',
        description: '',
        campaignType: 'email',
        status: 'draft',
        startDate: '',
        endDate: '',
        goalType: '',
        goalValue: '',
        notes: '',
      })
    }
  }, [campaign, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onSave({
        name: formData.name,
        description: formData.description || undefined,
        status: formData.status,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        goalType: formData.goalType || undefined,
        goalValue: formData.goalValue ? parseFloat(formData.goalValue) : undefined,
        notes: formData.notes || undefined,
        // Backend requires campaign_type
        campaign_type: formData.campaignType,
      } as any)
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save campaign:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>{campaign ? 'Edit Campaign' : 'Create New Campaign'}</DialogTitle>
          <DialogDescription>
            {campaign ? 'Update campaign information' : 'Create a new campaign to generate deals'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Campaign Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
              placeholder="Q1 2024 Product Launch"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Brief description of this campaign..."
              className="w-full min-h-[60px] px-3 py-2 rounded-md border border-input bg-background"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="campaignType">Campaign Type *</Label>
              <select
                id="campaignType"
                value={formData.campaignType}
                onChange={(e) => handleChange('campaignType', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-input bg-background"
                required
              >
                {CAMPAIGN_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-input bg-background"
                required
              >
                {STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="goalType">Goal Type</Label>
              <select
                id="goalType"
                value={formData.goalType}
                onChange={(e) => handleChange('goalType', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-input bg-background"
              >
                <option value="">No goal</option>
                {GOAL_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
              />
            </div>
          </div>

          {formData.goalType && (
            <div className="space-y-2">
              <Label htmlFor="goalValue">Goal Value</Label>
              <Input
                id="goalValue"
                type="number"
                step="0.01"
                value={formData.goalValue}
                onChange={(e) => handleChange('goalValue', e.target.value)}
                placeholder={formData.goalType === 'revenue' ? '100000' : '50'}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Additional notes about this campaign..."
              className="w-full min-h-[60px] px-3 py-2 rounded-md border border-input bg-background"
            />
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
              {loading ? 'Saving...' : campaign ? 'Update Campaign' : 'Create Campaign'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

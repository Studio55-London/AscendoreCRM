import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import type { ContactFilter } from '@/types'

interface ContactFilterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onApplyFilter: (filter: ContactFilter) => Promise<{ added: number }>
}

const LEAD_GRADES = ['A', 'B', 'C', 'D', 'F']

export function ContactFilterDialog({ open, onOpenChange, onApplyFilter }: ContactFilterDialogProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ added: number } | null>(null)
  const [tagInput, setTagInput] = useState('')
  const [filter, setFilter] = useState<ContactFilter>({
    tags: [],
    leadScore: {},
    leadGrade: [],
    company: '',
    createdAfter: '',
    createdBefore: '',
  })

  const handleAddTag = () => {
    if (tagInput.trim() && !filter.tags?.includes(tagInput.trim())) {
      setFilter(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFilter(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || [],
    }))
  }

  const handleToggleGrade = (grade: string) => {
    setFilter(prev => {
      const grades = prev.leadGrade || []
      if (grades.includes(grade)) {
        return { ...prev, leadGrade: grades.filter(g => g !== grade) }
      } else {
        return { ...prev, leadGrade: [...grades, grade] }
      }
    })
  }

  const handleApply = async () => {
    setLoading(true)
    setResult(null)

    try {
      const cleanFilter: ContactFilter = {}

      if (filter.tags && filter.tags.length > 0) {
        cleanFilter.tags = filter.tags
      }
      if (filter.leadScore?.min !== undefined || filter.leadScore?.max !== undefined) {
        cleanFilter.leadScore = {}
        if (filter.leadScore.min !== undefined && filter.leadScore.min !== '') {
          cleanFilter.leadScore.min = Number(filter.leadScore.min)
        }
        if (filter.leadScore.max !== undefined && filter.leadScore.max !== '') {
          cleanFilter.leadScore.max = Number(filter.leadScore.max)
        }
      }
      if (filter.leadGrade && filter.leadGrade.length > 0) {
        cleanFilter.leadGrade = filter.leadGrade
      }
      if (filter.company && filter.company.trim()) {
        cleanFilter.company = filter.company.trim()
      }
      if (filter.createdAfter) {
        cleanFilter.createdAfter = filter.createdAfter
      }
      if (filter.createdBefore) {
        cleanFilter.createdBefore = filter.createdBefore
      }

      const result = await onApplyFilter(cleanFilter)
      setResult(result)
    } catch (error) {
      console.error('Failed to apply filter:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFilter({
      tags: [],
      leadScore: {},
      leadGrade: [],
      company: '',
      createdAfter: '',
      createdBefore: '',
    })
    setTagInput('')
    setResult(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent onClose={handleClose}>
        <DialogHeader>
          <DialogTitle>Add Contacts by Filter</DialogTitle>
          <DialogDescription>
            Define filters to select contacts to add to this campaign
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="py-8 text-center">
            <div className="mb-4">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Contacts Added Successfully</h3>
              <p className="text-muted-foreground">
                {result.added} {result.added === 1 ? 'contact was' : 'contacts were'} added to the campaign
              </p>
            </div>
            <Button onClick={handleClose}>Close</Button>
          </div>
        ) : (
          <>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddTag()
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddTag}>Add</Button>
                </div>
                {filter.tags && filter.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {filter.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Lead Score Range</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input
                      type="number"
                      placeholder="Min (0)"
                      min="0"
                      max="100"
                      value={filter.leadScore?.min ?? ''}
                      onChange={(e) =>
                        setFilter(prev => ({
                          ...prev,
                          leadScore: { ...prev.leadScore, min: e.target.value ? Number(e.target.value) : undefined },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder="Max (100)"
                      min="0"
                      max="100"
                      value={filter.leadScore?.max ?? ''}
                      onChange={(e) =>
                        setFilter(prev => ({
                          ...prev,
                          leadScore: { ...prev.leadScore, max: e.target.value ? Number(e.target.value) : undefined },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Lead Grade</Label>
                <div className="flex gap-2">
                  {LEAD_GRADES.map((grade) => (
                    <Button
                      key={grade}
                      type="button"
                      variant={filter.leadGrade?.includes(grade) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleToggleGrade(grade)}
                    >
                      {grade}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                <Input
                  id="company"
                  placeholder="Filter by company..."
                  value={filter.company}
                  onChange={(e) => setFilter(prev => ({ ...prev, company: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Created Date Range</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="createdAfter" className="text-xs text-muted-foreground">After</Label>
                    <Input
                      id="createdAfter"
                      type="date"
                      value={filter.createdAfter}
                      onChange={(e) => setFilter(prev => ({ ...prev, createdAfter: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="createdBefore" className="text-xs text-muted-foreground">Before</Label>
                    <Input
                      id="createdBefore"
                      type="date"
                      value={filter.createdBefore}
                      onChange={(e) => setFilter(prev => ({ ...prev, createdBefore: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button onClick={handleApply} disabled={loading}>
                {loading ? 'Applying...' : 'Add Contacts'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

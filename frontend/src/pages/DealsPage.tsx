import { useEffect, useState, useMemo } from 'react'
import { Plus, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SearchInput } from '@/components/ui/search-input'
import { FilterSelect } from '@/components/ui/filter-select'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Pagination } from '@/components/ui/pagination'
import { DealsPipeline } from '@/components/crm/DealsPipeline'
import { DealDialog } from '@/components/crm/DealDialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/toast'
import { api } from '@/services/api'
import type { Deal, Contact, Company } from '@/types'
import { FloatingChat } from '@/components/chat/FloatingChat'
import { exportDeals } from '@/utils/export'

export function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [stageFilter, setStageFilter] = useState('all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [dealToDelete, setDealToDelete] = useState<Deal | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { addToast } = useToast()

  // Filter deals based on search query, stage filter, and date range
  const filteredDeals = useMemo(() => {
    let result = deals

    // Apply stage filter
    if (stageFilter !== 'all') {
      result = result.filter(deal => deal.stage === stageFilter)
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(deal =>
        deal.title?.toLowerCase().includes(query) ||
        deal.company?.name?.toLowerCase().includes(query) ||
        deal.contact?.name?.toLowerCase().includes(query) ||
        deal.stage?.toLowerCase().includes(query)
      )
    }

    // Apply date range filter
    if (dateRange.from || dateRange.to) {
      result = result.filter(deal => {
        if (!deal.createdAt) return false
        const dealDate = new Date(deal.createdAt)
        if (dateRange.from && dealDate < dateRange.from) return false
        if (dateRange.to && dealDate > dateRange.to) return false
        return true
      })
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      result = result.filter(deal =>
        deal.tags?.some(tag => selectedTags.includes(tag))
      )
    }

    return result
  }, [deals, searchQuery, stageFilter, dateRange, selectedTags])

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    deals.forEach(deal => {
      deal.tags?.forEach(tag => tags.add(tag))
    })
    return Array.from(tags).sort()
  }, [deals])

  const fetchDeals = async (page = 1) => {
    try {
      setLoading(true)
      const ITEMS_PER_PAGE = 20
      const response = await api.getDeals({
        limit: ITEMS_PER_PAGE,
        offset: (page - 1) * ITEMS_PER_PAGE
      })
      setDeals(response.data)
      setTotalPages(response.totalPages)
      setCurrentPage(page)
    } catch (error) {
      console.error('Failed to fetch deals:', error)
      addToast({
        title: 'Error',
        description: 'Failed to load deals',
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

  useEffect(() => {
    fetchDeals(1)
    fetchContacts()
    fetchCompanies()
  }, [])

  const handleAddDeal = () => {
    setSelectedDeal(null)
    setDialogOpen(true)
  }

  const handleEditDeal = (deal: Deal) => {
    setSelectedDeal(deal)
    setDialogOpen(true)
  }

  const handleSaveDeal = async (data: Partial<Deal>) => {
    try {
      // Transform frontend field names to backend field names
      const dealData: any = {
        name: data.title,  // Backend expects 'name' not 'title'
        amount: data.value,  // Backend expects 'amount' not 'value'
        currency: data.currency || 'USD',
        stage: data.stage,
        probability: data.probability || 0,
        expected_close_date: data.expectedCloseDate,
        description: data.notes,
        tags: [],
        custom_fields: {},
      }

      // Add contact and company IDs if provided
      if (data.contactId) {
        dealData.primary_contact_id = data.contactId
      }
      if (data.companyId) {
        dealData.company_id = data.companyId
      }

      if (selectedDeal) {
        await api.updateDeal(selectedDeal.id, dealData)
        addToast({
          title: 'Success',
          description: 'Deal updated successfully',
          variant: 'success',
        })
      } else {
        await api.createDeal(dealData)
        addToast({
          title: 'Success',
          description: 'Deal created successfully',
          variant: 'success',
        })
      }
      await fetchDeals()
      setDialogOpen(false)
    } catch (error: any) {
      console.error('Failed to save deal:', error)
      addToast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save deal',
        variant: 'error',
      })
      throw error
    }
  }

  const handleDeleteClick = (deal: Deal) => {
    setDealToDelete(deal)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!dealToDelete) return

    try {
      setDeleteLoading(true)
      await api.deleteDeal(dealToDelete.id)
      addToast({
        title: 'Success',
        description: 'Deal deleted successfully',
        variant: 'success',
      })
      await fetchDeals()
      setDeleteConfirmOpen(false)
      setDealToDelete(null)
    } catch (error) {
      console.error('Failed to delete deal:', error)
      addToast({
        title: 'Error',
        description: 'Failed to delete deal',
        variant: 'error',
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleStageChange = async (dealId: string, newStage: string) => {
    try {
      // Optimistic update
      setDeals((prevDeals) =>
        prevDeals.map((deal) =>
          deal.id === dealId ? { ...deal, stage: newStage as any } : deal
        )
      )

      // Update on backend
      await api.updateDeal(dealId, { stage: newStage })
      addToast({
        title: 'Success',
        description: 'Deal stage updated successfully',
        variant: 'success',
      })
    } catch (error) {
      console.error('Failed to update deal stage:', error)
      addToast({
        title: 'Error',
        description: 'Failed to update deal stage',
        variant: 'error',
      })
      // Revert optimistic update
      await fetchDeals()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deals</h1>
          <p className="text-muted-foreground">Track your sales pipeline</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => exportDeals(filteredDeals)}
            disabled={filteredDeals.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={handleAddDeal}>
            <Plus className="mr-2 h-4 w-4" />
            Add Deal
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search deals by title, company, contact, or stage..."
          className="max-w-md flex-1"
        />
        <FilterSelect
          label="Stage"
          value={stageFilter}
          options={[
            { label: 'All Stages', value: 'all' },
            { label: 'Lead', value: 'lead' },
            { label: 'Qualified', value: 'qualified' },
            { label: 'Proposal', value: 'proposal' },
            { label: 'Negotiation', value: 'negotiation' },
            { label: 'Closed Won', value: 'closed_won' },
            { label: 'Closed Lost', value: 'closed_lost' },
          ]}
          onChange={setStageFilter}
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

      <DealsPipeline
        deals={filteredDeals}
        loading={loading}
        onEdit={handleEditDeal}
        onDelete={handleDeleteClick}
        onStageChange={handleStageChange}
      />

      <DealDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        deal={selectedDeal}
        contacts={contacts}
        companies={companies}
        onSave={handleSaveDeal}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Deal"
        description={`Are you sure you want to delete "${dealToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={fetchDeals}
      />

      <FloatingChat />
    </div>
  )
}

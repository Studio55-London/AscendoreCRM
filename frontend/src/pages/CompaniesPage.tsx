import { useEffect, useState, useMemo } from 'react'
import { Plus, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SearchInput } from '@/components/ui/search-input'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Pagination } from '@/components/ui/pagination'
import { CompanyList } from '@/components/crm/CompanyList'
import { CompanyDialog } from '@/components/crm/CompanyDialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/toast'
import { api } from '@/services/api'
import type { Company } from '@/types'
import { FloatingChat } from '@/components/chat/FloatingChat'
import { exportCompanies } from '@/utils/export'

export function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { addToast } = useToast()

  // Filter companies based on search query and date range
  const filteredCompanies = useMemo(() => {
    let result = companies

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(company =>
        company.name?.toLowerCase().includes(query) ||
        company.domain?.toLowerCase().includes(query) ||
        company.industry?.toLowerCase().includes(query) ||
        company.website?.toLowerCase().includes(query)
      )
    }

    // Apply date range filter
    if (dateRange.from || dateRange.to) {
      result = result.filter(company => {
        if (!company.createdAt) return false
        const companyDate = new Date(company.createdAt)
        if (dateRange.from && companyDate < dateRange.from) return false
        if (dateRange.to && companyDate > dateRange.to) return false
        return true
      })
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      result = result.filter(company =>
        company.tags?.some(tag => selectedTags.includes(tag))
      )
    }

    return result
  }, [companies, searchQuery, dateRange, selectedTags])

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    companies.forEach(company => {
      company.tags?.forEach(tag => tags.add(tag))
    })
    return Array.from(tags).sort()
  }, [companies])

  const fetchCompanies = async (page = 1) => {
    try {
      setLoading(true)
      const ITEMS_PER_PAGE = 20
      const response = await api.getCompanies({
        limit: ITEMS_PER_PAGE,
        offset: (page - 1) * ITEMS_PER_PAGE
      })
      setCompanies(response.data)
      setTotalPages(response.totalPages)
      setCurrentPage(page)
    } catch (error) {
      console.error('Failed to fetch companies:', error)
      addToast({
        title: 'Error',
        description: 'Failed to load companies',
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCompanies(1)
  }, [])

  const handleAddCompany = () => {
    setSelectedCompany(null)
    setDialogOpen(true)
  }

  const handleEditCompany = (company: Company) => {
    setSelectedCompany(company)
    setDialogOpen(true)
  }

  const handleSaveCompany = async (data: Partial<Company>) => {
    try {
      if (selectedCompany) {
        await api.updateCompany(selectedCompany.id, data)
        addToast({
          title: 'Success',
          description: 'Company updated successfully',
          variant: 'success',
        })
      } else {
        await api.createCompany(data)
        addToast({
          title: 'Success',
          description: 'Company created successfully',
          variant: 'success',
        })
      }
      await fetchCompanies()
      setDialogOpen(false)
    } catch (error: any) {
      console.error('Failed to save company:', error)
      addToast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save company',
        variant: 'error',
      })
      throw error
    }
  }

  const handleDeleteClick = (company: Company) => {
    setCompanyToDelete(company)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!companyToDelete) return

    try {
      setDeleteLoading(true)
      await api.deleteCompany(companyToDelete.id)
      addToast({
        title: 'Success',
        description: 'Company deleted successfully',
        variant: 'success',
      })
      await fetchCompanies()
      setDeleteConfirmOpen(false)
      setCompanyToDelete(null)
    } catch (error) {
      console.error('Failed to delete company:', error)
      addToast({
        title: 'Error',
        description: 'Failed to delete company',
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
          <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
          <p className="text-muted-foreground">Manage your company accounts</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => exportCompanies(filteredCompanies)}
            disabled={filteredCompanies.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={handleAddCompany}>
            <Plus className="mr-2 h-4 w-4" />
            Add Company
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search companies by name, domain, industry, or website..."
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

      <CompanyList
        companies={filteredCompanies}
        loading={loading}
        onEdit={handleEditCompany}
        onDelete={handleDeleteClick}
      />

      <CompanyDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        company={selectedCompany}
        onSave={handleSaveCompany}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Company"
        description={`Are you sure you want to delete ${companyToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={fetchCompanies}
      />

      <FloatingChat />
    </div>
  )
}

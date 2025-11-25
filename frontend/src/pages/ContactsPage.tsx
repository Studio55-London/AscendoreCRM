import { useEffect, useState, useMemo } from 'react'
import { Plus, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SearchInput } from '@/components/ui/search-input'
import { FilterSelect } from '@/components/ui/filter-select'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Pagination } from '@/components/ui/pagination'
import { ContactList } from '@/components/crm/ContactList'
import { ContactDialog } from '@/components/crm/ContactDialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/toast'
import { api } from '@/services/api'
import type { Contact, Company } from '@/types'
import { FloatingChat } from '@/components/chat/FloatingChat'
import { exportContacts } from '@/utils/export'

export function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [companyFilter, setCompanyFilter] = useState('all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { addToast } = useToast()

  // Filter contacts based on search query, company filter, and date range
  const filteredContacts = useMemo(() => {
    let result = contacts

    // Apply company filter
    if (companyFilter !== 'all') {
      result = result.filter(contact => contact.companyId === companyFilter)
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(contact =>
        contact.name?.toLowerCase().includes(query) ||
        contact.email?.toLowerCase().includes(query) ||
        contact.company?.toLowerCase().includes(query) ||
        contact.position?.toLowerCase().includes(query)
      )
    }

    // Apply date range filter
    if (dateRange.from || dateRange.to) {
      result = result.filter(contact => {
        if (!contact.createdAt) return false
        const contactDate = new Date(contact.createdAt)
        if (dateRange.from && contactDate < dateRange.from) return false
        if (dateRange.to && contactDate > dateRange.to) return false
        return true
      })
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      result = result.filter(contact =>
        contact.tags?.some(tag => selectedTags.includes(tag))
      )
    }

    return result
  }, [contacts, searchQuery, companyFilter, dateRange, selectedTags])

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    contacts.forEach(contact => {
      contact.tags?.forEach(tag => tags.add(tag))
    })
    return Array.from(tags).sort()
  }, [contacts])

  const fetchContacts = async (page = 1) => {
    try {
      setLoading(true)
      const ITEMS_PER_PAGE = 20
      const response = await api.getContacts({
        limit: ITEMS_PER_PAGE,
        offset: (page - 1) * ITEMS_PER_PAGE
      })
      setContacts(response.data)
      setTotalPages(response.totalPages)
      setCurrentPage(page)
    } catch (error) {
      console.error('Failed to fetch contacts:', error)
      addToast({
        title: 'Error',
        description: 'Failed to load contacts',
        variant: 'error',
      })
    } finally {
      setLoading(false)
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
    fetchContacts(1)
    fetchCompanies()
  }, [])

  const handleAddContact = () => {
    setSelectedContact(null)
    setDialogOpen(true)
  }

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact)
    setDialogOpen(true)
  }

  const handleSaveContact = async (data: Partial<Contact>) => {
    try {
      const contactData: any = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        title: data.title,
        notes: data.notes,
        contact_status: 'active',
      }

      // Add company ID if provided
      if (data.crm_company_id) {
        contactData.crm_company_id = data.crm_company_id
      }

      if (selectedContact) {
        // Update existing contact
        await api.updateContact(selectedContact.id, contactData)
        addToast({
          title: 'Success',
          description: 'Contact updated successfully',
          variant: 'success',
        })
      } else {
        // Create new contact
        await api.createContact(contactData)
        addToast({
          title: 'Success',
          description: 'Contact created successfully',
          variant: 'success',
        })
      }
      await fetchContacts()
      setDialogOpen(false)
    } catch (error: any) {
      console.error('Failed to save contact:', error)
      addToast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save contact',
        variant: 'error',
      })
      throw error
    }
  }

  const handleDeleteClick = (contact: Contact) => {
    setContactToDelete(contact)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!contactToDelete) return

    try {
      setDeleteLoading(true)
      await api.deleteContact(contactToDelete.id)
      addToast({
        title: 'Success',
        description: 'Contact deleted successfully',
        variant: 'success',
      })
      await fetchContacts()
      setDeleteConfirmOpen(false)
      setContactToDelete(null)
    } catch (error) {
      console.error('Failed to delete contact:', error)
      addToast({
        title: 'Error',
        description: 'Failed to delete contact',
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
          <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground">Manage your contacts and leads</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => exportContacts(filteredContacts)}
            disabled={filteredContacts.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={handleAddContact}>
            <Plus className="mr-2 h-4 w-4" />
            Add Contact
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search contacts by name, email, company, or position..."
          className="max-w-md flex-1"
        />
        <FilterSelect
          label="Company"
          value={companyFilter}
          options={[
            { label: 'All Companies', value: 'all' },
            ...companies.map(c => ({ label: c.name, value: c.id }))
          ]}
          onChange={setCompanyFilter}
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

      <ContactList
        contacts={filteredContacts}
        loading={loading}
        onEdit={handleEditContact}
        onDelete={handleDeleteClick}
      />

      <ContactDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        contact={selectedContact}
        companies={companies}
        onSave={handleSaveContact}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Contact"
        description={`Are you sure you want to delete ${contactToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={fetchContacts}
      />

      <FloatingChat />
    </div>
  )
}

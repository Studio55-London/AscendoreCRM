import { useEffect, useState, useMemo } from 'react'
import { Plus, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/search-input'
import { Pagination } from '@/components/ui/pagination'
import { CampaignList } from '@/components/crm/CampaignList'
import { CampaignDialog } from '@/components/crm/CampaignDialog'
import { CampaignDetail } from '@/components/crm/CampaignDetail'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/toast'
import { api } from '@/services/api'
import type { Campaign, CampaignWithDetails, ContactFilter } from '@/types'
import { FloatingChat } from '@/components/chat/FloatingChat'

export function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [campaignToEdit, setCampaignToEdit] = useState<Campaign | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { addToast } = useToast()

  // Filter campaigns based on search query
  const filteredCampaigns = useMemo(() => {
    if (!searchQuery) return campaigns

    const query = searchQuery.toLowerCase()
    return campaigns.filter(campaign =>
      campaign.name?.toLowerCase().includes(query) ||
      campaign.description?.toLowerCase().includes(query) ||
      campaign.status?.toLowerCase().includes(query)
    )
  }, [campaigns, searchQuery])

  const fetchCampaigns = async (page = 1) => {
    try {
      setLoading(true)
      const ITEMS_PER_PAGE = 20
      const response = await api.getCampaigns({
        page,
        limit: ITEMS_PER_PAGE,
      })
      setCampaigns(response.data)
      setTotalPages(response.totalPages)
      setCurrentPage(page)
    } catch (error) {
      console.error('Failed to fetch campaigns:', error)
      addToast({
        title: 'Error',
        description: 'Failed to load campaigns',
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchCampaignDetail = async (campaignId: string) => {
    try {
      setDetailLoading(true)
      const campaign = await api.getCampaign(campaignId)
      setSelectedCampaign(campaign)
    } catch (error) {
      console.error('Failed to fetch campaign details:', error)
      addToast({
        title: 'Error',
        description: 'Failed to load campaign details',
        variant: 'error',
      })
    } finally {
      setDetailLoading(false)
    }
  }

  useEffect(() => {
    fetchCampaigns(1)
  }, [])

  const handleAddCampaign = () => {
    setCampaignToEdit(null)
    setDialogOpen(true)
  }

  const handleEditCampaign = (campaign: Campaign) => {
    setCampaignToEdit(campaign)
    setDialogOpen(true)
  }

  const handleCampaignClick = async (campaign: Campaign) => {
    await fetchCampaignDetail(campaign.id)
  }

  const handleBackToList = () => {
    setSelectedCampaign(null)
  }

  const handleSaveCampaign = async (data: Partial<Campaign>) => {
    try {
      if (campaignToEdit) {
        await api.updateCampaign(campaignToEdit.id, data)
        addToast({
          title: 'Success',
          description: 'Campaign updated successfully',
          variant: 'success',
        })
      } else {
        await api.createCampaign(data)
        addToast({
          title: 'Success',
          description: 'Campaign created successfully',
          variant: 'success',
        })
      }
      fetchCampaigns(currentPage)
      if (selectedCampaign && campaignToEdit?.id === selectedCampaign.id) {
        fetchCampaignDetail(selectedCampaign.id)
      }
    } catch (error) {
      console.error('Failed to save campaign:', error)
      addToast({
        title: 'Error',
        description: 'Failed to save campaign',
        variant: 'error',
      })
      throw error
    }
  }

  const handleDeleteCampaign = (campaign: Campaign) => {
    setCampaignToDelete(campaign)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!campaignToDelete) return

    try {
      setDeleteLoading(true)
      await api.deleteCampaign(campaignToDelete.id)
      addToast({
        title: 'Success',
        description: 'Campaign deleted successfully',
        variant: 'success',
      })
      fetchCampaigns(currentPage)
      if (selectedCampaign?.id === campaignToDelete.id) {
        setSelectedCampaign(null)
      }
    } catch (error) {
      console.error('Failed to delete campaign:', error)
      addToast({
        title: 'Error',
        description: 'Failed to delete campaign',
        variant: 'error',
      })
    } finally {
      setDeleteLoading(false)
      setDeleteConfirmOpen(false)
      setCampaignToDelete(null)
    }
  }

  const handleRemoveContact = async (contactId: string) => {
    if (!selectedCampaign) return

    try {
      await api.removeContactsFromCampaign(selectedCampaign.id, [contactId])
      addToast({
        title: 'Success',
        description: 'Contact removed from campaign',
        variant: 'success',
      })
      fetchCampaignDetail(selectedCampaign.id)
    } catch (error) {
      console.error('Failed to remove contact:', error)
      addToast({
        title: 'Error',
        description: 'Failed to remove contact',
        variant: 'error',
      })
    }
  }

  const handleAddContactsByFilter = async (filter: ContactFilter) => {
    if (!selectedCampaign) return { added: 0 }

    try {
      const result = await api.addContactsToCampaignByFilter(selectedCampaign.id, filter)
      addToast({
        title: 'Success',
        description: `${result.added} contacts added to campaign`,
        variant: 'success',
      })
      return result
    } catch (error) {
      console.error('Failed to add contacts:', error)
      addToast({
        title: 'Error',
        description: 'Failed to add contacts',
        variant: 'error',
      })
      throw error
    }
  }

  return (
    <div className="space-y-6">
      {selectedCampaign ? (
        <>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackToList}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Campaign Details</h1>
              <p className="text-muted-foreground">Manage campaign contacts and activities</p>
            </div>
            <div className="ml-auto">
              <Button onClick={() => handleEditCampaign(selectedCampaign)}>
                Edit Campaign
              </Button>
            </div>
          </div>

          {detailLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <CampaignDetail
              campaign={selectedCampaign}
              onRemoveContact={handleRemoveContact}
              onAddContactsByFilter={handleAddContactsByFilter}
              onRefresh={() => fetchCampaignDetail(selectedCampaign.id)}
            />
          )}
        </>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
              <p className="text-muted-foreground">Manage your marketing campaigns and outreach</p>
            </div>
            <Button onClick={handleAddCampaign}>
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search campaigns..."
              className="max-w-md"
            />
          </div>

          <CampaignList
            campaigns={filteredCampaigns}
            loading={loading}
            onCampaignClick={handleCampaignClick}
            onEdit={handleEditCampaign}
            onDelete={handleDeleteCampaign}
          />

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={fetchCampaigns}
            />
          )}
        </>
      )}

      <CampaignDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        campaign={campaignToEdit}
        onSave={handleSaveCampaign}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={confirmDelete}
        title="Delete Campaign"
        description={`Are you sure you want to delete "${campaignToDelete?.name}"? This action cannot be undone.`}
        loading={deleteLoading}
      />

      <FloatingChat />
    </div>
  )
}

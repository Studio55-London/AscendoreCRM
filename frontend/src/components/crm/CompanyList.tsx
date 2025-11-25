import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Building2, Globe, Phone, MoreVertical, Edit2, Trash2 } from 'lucide-react'
import { getInitials, formatRelativeTime } from '@/utils/format'
import type { Company } from '@/types'

interface CompanyListProps {
  companies: Company[]
  loading: boolean
  onCompanyClick?: (company: Company) => void
  onEdit?: (company: Company) => void
  onDelete?: (company: Company) => void
}

export function CompanyList({ companies, loading, onCompanyClick, onEdit, onDelete }: CompanyListProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Companies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-48 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (companies.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Companies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground">No companies found</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Companies</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {companies.map((company) => (
            <div
              key={company.id}
              className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
              onClick={() => onCompanyClick?.(company)}
            >
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(company.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{company.name}</div>
                  <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                    {company.industry && (
                      <span className="flex items-center">
                        <Building2 className="h-3 w-3 mr-1" />
                        {company.industry}
                      </span>
                    )}
                    {company.website && (
                      <span className="flex items-center">
                        <Globe className="h-3 w-3 mr-1" />
                        {company.website}
                      </span>
                    )}
                    {company.phone && (
                      <span className="flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {company.phone}
                      </span>
                    )}
                  </div>
                  {company.size && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Size: {company.size}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {company.tags && company.tags.length > 0 && (
                  <div className="flex space-x-1">
                    {company.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      setOpenMenuId(openMenuId === company.id ? null : company.id)
                    }}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                  {openMenuId === company.id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setOpenMenuId(null)}
                      />
                      <div className="absolute right-0 mt-1 w-48 bg-background border rounded-md shadow-lg z-20">
                        <button
                          className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-2"
                          onClick={(e) => {
                            e.stopPropagation()
                            onEdit?.(company)
                            setOpenMenuId(null)
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                          Edit Company
                        </button>
                        <button
                          className="w-full px-4 py-2 text-left text-sm hover:bg-accent text-destructive flex items-center gap-2"
                          onClick={(e) => {
                            e.stopPropagation()
                            onDelete?.(company)
                            setOpenMenuId(null)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Company
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

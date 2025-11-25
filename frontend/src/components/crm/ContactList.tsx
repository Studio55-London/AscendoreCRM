import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Mail, Phone, Building2, MoreVertical, Edit2, Trash2, TrendingUp } from 'lucide-react'
import { getInitials, formatRelativeTime } from '@/utils/format'
import type { Contact } from '@/types'

function getLeadScoreBadgeVariant(grade?: string): 'default' | 'secondary' | 'destructive' {
  if (!grade) return 'secondary'
  const upperGrade = grade.toUpperCase()
  if (upperGrade === 'A') return 'default' // Hot lead
  if (upperGrade === 'B' || upperGrade === 'C') return 'secondary' // Warm/Cold lead
  return 'destructive' // Very cold or not qualified
}

function getLeadScoreLabel(score?: number, grade?: string): string {
  if (grade) return `Lead: ${grade}`
  if (score !== undefined) return `Score: ${score}`
  return 'No score'
}

interface ContactListProps {
  contacts: Contact[]
  loading: boolean
  onContactClick?: (contact: Contact) => void
  onEdit?: (contact: Contact) => void
  onDelete?: (contact: Contact) => void
}

export function ContactList({ contacts, loading, onContactClick, onEdit, onDelete }: ContactListProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Contacts</CardTitle>
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

  if (contacts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Contacts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground">No contacts found</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contacts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
              onClick={() => onContactClick?.(contact)}
            >
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(contact.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{contact.name}</div>
                  <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                    {contact.email && (
                      <span className="flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {contact.email}
                      </span>
                    )}
                    {contact.phone && (
                      <span className="flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {contact.phone}
                      </span>
                    )}
                  </div>
                  {contact.company && (
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Building2 className="h-3 w-3 mr-1" />
                      {contact.company}
                      {contact.position && ` • ${contact.position}`}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {(contact.leadScore !== undefined || contact.leadGrade) && (
                  <Badge
                    variant={getLeadScoreBadgeVariant(contact.leadGrade)}
                    className="flex items-center gap-1"
                  >
                    <TrendingUp className="h-3 w-3" />
                    {getLeadScoreLabel(contact.leadScore, contact.leadGrade)}
                  </Badge>
                )}
                {contact.tags && contact.tags.length > 0 && (
                  <div className="flex space-x-1">
                    {contact.tags.slice(0, 2).map((tag) => (
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
                      setOpenMenuId(openMenuId === contact.id ? null : contact.id)
                    }}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                  {openMenuId === contact.id && (
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
                            onEdit?.(contact)
                            setOpenMenuId(null)
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                          Edit Contact
                        </button>
                        <button
                          className="w-full px-4 py-2 text-left text-sm hover:bg-accent text-destructive flex items-center gap-2"
                          onClick={(e) => {
                            e.stopPropagation()
                            onDelete?.(contact)
                            setOpenMenuId(null)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Contact
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

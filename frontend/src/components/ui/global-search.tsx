import { useState, useEffect, useCallback } from 'react'
import { Search, User, Building2, DollarSign, CheckSquare, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/services/api'
import type { Contact, Company, Deal, Activity } from '@/types'
import { cn } from '@/utils/cn'

interface SearchResult {
  type: 'contact' | 'company' | 'deal' | 'activity'
  id: string
  title: string
  subtitle?: string
  data: Contact | Company | Deal | Activity
}

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const navigate = useNavigate()

  // Open search with Cmd+K or Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  // Search across all entities
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const [contacts, companies, deals, activities] = await Promise.all([
        api.getContacts({ limit: 5 }).catch(() => ({ data: [] })),
        api.getCompanies({ limit: 5 }).catch(() => ({ data: [] })),
        api.getDeals({ limit: 5 }).catch(() => ({ data: [] })),
        api.getActivities({ limit: 5 }).catch(() => ({ data: [] })),
      ])

      const query = searchQuery.toLowerCase()
      const searchResults: SearchResult[] = []

      // Filter contacts
      contacts.data
        .filter(c =>
          c.name?.toLowerCase().includes(query) ||
          c.email?.toLowerCase().includes(query) ||
          c.company?.toLowerCase().includes(query)
        )
        .forEach(contact => {
          searchResults.push({
            type: 'contact',
            id: contact.id,
            title: contact.name,
            subtitle: contact.email || contact.company,
            data: contact,
          })
        })

      // Filter companies
      companies.data
        .filter(c =>
          c.name?.toLowerCase().includes(query) ||
          c.domain?.toLowerCase().includes(query) ||
          c.industry?.toLowerCase().includes(query)
        )
        .forEach(company => {
          searchResults.push({
            type: 'company',
            id: company.id,
            title: company.name,
            subtitle: company.industry || company.domain,
            data: company,
          })
        })

      // Filter deals
      deals.data
        .filter(d =>
          d.title?.toLowerCase().includes(query) ||
          d.company?.name?.toLowerCase().includes(query)
        )
        .forEach(deal => {
          searchResults.push({
            type: 'deal',
            id: deal.id,
            title: deal.title,
            subtitle: `$${deal.value.toLocaleString()} • ${deal.stage}`,
            data: deal,
          })
        })

      // Filter activities
      activities.data
        .filter(a =>
          a.title?.toLowerCase().includes(query) ||
          a.description?.toLowerCase().includes(query)
        )
        .forEach(activity => {
          searchResults.push({
            type: 'activity',
            id: activity.id,
            title: activity.title,
            subtitle: `${activity.type} • ${activity.description?.substring(0, 50)}`,
            data: activity,
          })
        })

      setResults(searchResults)
      setSelectedIndex(0)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, performSearch])

  const handleSelect = (result: SearchResult) => {
    // Navigate to the appropriate page
    switch (result.type) {
      case 'contact':
        navigate('/contacts')
        break
      case 'company':
        navigate('/companies')
        break
      case 'deal':
        navigate('/deals')
        break
      case 'activity':
        navigate('/activities')
        break
    }
    setIsOpen(false)
    setQuery('')
  }

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'contact':
        return <User className="h-4 w-4" />
      case 'company':
        return <Building2 className="h-4 w-4" />
      case 'deal':
        return <DollarSign className="h-4 w-4" />
      case 'activity':
        return <CheckSquare className="h-4 w-4" />
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault()
      handleSelect(results[selectedIndex])
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground border rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        <Search className="h-4 w-4" />
        <span>Search...</span>
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
    )
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Search Dialog */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2">
        <div className="bg-background border rounded-lg shadow-lg overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center border-b px-4">
            <Search className="h-4 w-4 text-muted-foreground mr-2" />
            <input
              type="text"
              placeholder="Search contacts, companies, deals, activities..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
              autoFocus
            />
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[300px] overflow-y-auto p-2">
            {loading && (
              <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                Searching...
              </div>
            )}

            {!loading && query && results.length === 0 && (
              <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                No results found
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="space-y-1">
                {results.map((result, index) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSelect(result)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors',
                      selectedIndex === index
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <div className="flex-shrink-0 text-muted-foreground">
                      {getIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {result.title}
                      </div>
                      {result.subtitle && (
                        <div className="text-xs text-muted-foreground truncate">
                          {result.subtitle}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground uppercase px-1.5 py-0.5 rounded bg-muted">
                      {result.type}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {!loading && !query && (
              <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                Type to search across all entities...
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t p-2 flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-muted">↑↓</kbd>
              <span>Navigate</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-muted">Enter</kbd>
              <span>Select</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-muted">Esc</kbd>
              <span>Close</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

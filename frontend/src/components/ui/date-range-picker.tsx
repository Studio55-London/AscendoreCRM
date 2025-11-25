import { useState } from 'react'
import { Calendar } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/utils/cn'

interface DateRangePickerProps {
  value?: { from: Date | null; to: Date | null }
  onChange: (range: { from: Date | null; to: Date | null }) => void
  className?: string
}

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tempFrom, setTempFrom] = useState<string>(
    value?.from ? value.from.toISOString().split('T')[0] : ''
  )
  const [tempTo, setTempTo] = useState<string>(
    value?.to ? value.to.toISOString().split('T')[0] : ''
  )

  const handleApply = () => {
    onChange({
      from: tempFrom ? new Date(tempFrom) : null,
      to: tempTo ? new Date(tempTo) : null,
    })
    setIsOpen(false)
  }

  const handleClear = () => {
    setTempFrom('')
    setTempTo('')
    onChange({ from: null, to: null })
    setIsOpen(false)
  }

  const formatDateRange = () => {
    if (!value?.from && !value?.to) return 'Select date range'
    if (value.from && value.to) {
      return `${value.from.toLocaleDateString()} - ${value.to.toLocaleDateString()}`
    }
    if (value.from) return `From ${value.from.toLocaleDateString()}`
    if (value.to) return `To ${value.to.toLocaleDateString()}`
    return 'Select date range'
  }

  return (
    <div className={cn('relative', className)}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-start text-left font-normal"
      >
        <Calendar className="mr-2 h-4 w-4" />
        {formatDateRange()}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 top-full mt-2 z-20 w-80 bg-background border rounded-lg shadow-lg p-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">From</label>
                <input
                  type="date"
                  value={tempFrom}
                  onChange={(e) => setTempFrom(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">To</label>
                <input
                  type="date"
                  value={tempTo}
                  onChange={(e) => setTempTo(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleClear}
                  className="flex-1"
                >
                  Clear
                </Button>
                <Button
                  onClick={handleApply}
                  className="flex-1"
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

import { Search } from 'lucide-react'
import { cn } from '../../utils/cn'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  ariaLabel?: string
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search',
  className,
  ariaLabel,
}: SearchInputProps) {
  return (
    <div className={cn('relative', className)}>
      <Search
        size={15}
        strokeWidth={1.7}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        className="h-10 w-full border border-line bg-surface pl-9 pr-3 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-ink"
      />
    </div>
  )
}


import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Search bills...',
  className,
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Handle input change with debounce
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    // Clear any existing timeout
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    
    // Set a new timeout
    searchDebounceRef.current = setTimeout(() => {
      onSearch(value);
    }, 300);
  };

  // Clear search query
  const handleClear = () => {
    setQuery('');
    onSearch('');
    inputRef.current?.focus();
  };

  // Handle key down events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, []);

  return (
    <div 
      className={cn(
        "relative flex items-center transition-all",
        isFocused ? "ring-1 ring-primary/20" : "",
        className
      )}
    >
      <div className="absolute left-3 text-muted-foreground">
        <Search className="h-4 w-4" />
      </div>
      
      <Input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className={cn(
          "pl-9 pr-9 py-2 transition-all duration-200",
          "focus-visible:ring-primary/20"
        )}
      />
      
      {query && (
        <div className="absolute right-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="h-5 w-5 opacity-70 hover:opacity-100"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default SearchBar;

import { useState } from 'react';
import { Search, Sparkles, X } from 'lucide-react';

export default function SearchBar({
  placeholder = 'Search...',
  onSearch = () => {},
  variant = 'hero',
  filters = [],
  className = '',
}) {
  const [query, setQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query, activeFilters);
  };

  const toggleFilter = (filter) => {
    setActiveFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  if (variant === 'hero') {
    return (
      <form onSubmit={handleSubmit} className={`w-full max-w-2xl mx-auto ${className}`}>
        <div className="relative group">
          <div className="absolute inset-0 bg-white/20 rounded-full blur-xl group-hover:bg-white/30 transition-all duration-500" />
          <div className="relative flex items-center bg-white/95 backdrop-blur-sm rounded-full shadow-lg shadow-navy-950/20 border border-white/50">
            <div className="pl-5 pr-2 py-4 flex items-center gap-2 text-navy/40">
              <Sparkles className="w-5 h-5 text-saffron" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="flex-1 py-4 text-base text-charcoal placeholder-charcoal-muted/50 bg-transparent outline-none"
              aria-label={placeholder}
            />
            <button
              type="submit"
              className="m-1.5 px-6 py-3 bg-navy hover:bg-navy-700 text-white rounded-full font-medium text-sm transition-all duration-200 flex items-center gap-2 shadow-sm"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>
        </div>
      </form>
    );
  }

  // Dashboard variant
  return (
    <form onSubmit={handleSubmit} className={`w-full ${className}`}>
      <div className="flex items-center bg-white rounded-xl border border-navy-100 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="pl-4 text-navy/40">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="flex-1 py-3 px-3 text-sm text-charcoal placeholder-charcoal-muted/50 bg-transparent outline-none"
          aria-label={placeholder}
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); onSearch('', activeFilters); }}
            className="p-2 text-charcoal-muted hover:text-charcoal transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          type="submit"
          className="m-1 px-4 py-2 bg-navy hover:bg-navy-700 text-white rounded-lg font-medium text-sm transition-colors"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>

      {/* Filter chips */}
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => toggleFilter(filter)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                activeFilters.includes(filter)
                  ? 'bg-navy text-white'
                  : 'bg-navy-50 text-navy hover:bg-navy-100'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      )}
    </form>
  );
}

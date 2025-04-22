import React, { useState } from 'react';//correct
import { Search, X } from 'lucide-react';//correct

export const SearchBar = ({ 
  onSearch, 
  placeholder = 'Search...',
  debounceMs = 300 
}) => {
  const [query, setQuery] = useState('');

  const handleSearch = (value) => {
    setQuery(value);
    const timeoutId = setTimeout(() => {
      onSearch(value);
    }, debounceMs);
    return () => clearTimeout(timeoutId);
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-10 py-2 w-full border rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-300"
      />
      {query && (
        <button
          onClick={() => handleSearch('')}
          className="absolute right-3 top-1/2 transform -translate-y-1/2"
        >
          <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
        </button>
      )}
    </div>
  );
};
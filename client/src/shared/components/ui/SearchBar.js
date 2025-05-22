import { Search, X } from 'lucide-react'; //correct
import React, { useState } from 'react'; //correct

/**
 * @typedef {object} SearchBarProps
 * @property {function(string): void} onSearch - Callback function to be called with the search query after debouncing.
 * @property {string} [placeholder='Search...'] - The placeholder text for the input field.
 * @property {number} [debounceMs=300] - The debounce delay in milliseconds.
 */

/**
 * @desc A reusable Search Bar component with debouncing.
 * Allows users to type a search query, and the `onSearch` callback is triggered after a delay.
 * @param {SearchBarProps} props - The component props.
 * @returns {JSX.Element} - The rendered SearchBar component.
 */
export const SearchBar = ({ onSearch, placeholder = 'Search...', debounceMs = 300 }) => {
  const [query, setQuery] = useState('');

  /**
   * @desc Handles input change, updates the query state, and debounces the search callback.
   * @param {string} value - The current input value.
   * @returns {function(): void} - Cleanup function to clear the timeout.
   */
  const handleSearch = value => {
    setQuery(value);
    // Clear previous timeout
    if (handleSearch.timeoutId) {
        clearTimeout(handleSearch.timeoutId);
    }
    const timeoutId = setTimeout(() => {
      onSearch(value);
    }, debounceMs);
    // Store timeoutId on the function itself for cleanup
    handleSearch.timeoutId = timeoutId;
    return () => clearTimeout(timeoutId);
  };

  // Cleanup timeout on unmount
  React.useEffect(() => {
      return () => {
          if (handleSearch.timeoutId) {
              clearTimeout(handleSearch.timeoutId);
          }
      };
  }, []);


  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
      <input
        type="text"
        value={query}
        onChange={e => handleSearch(e.target.value)}
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

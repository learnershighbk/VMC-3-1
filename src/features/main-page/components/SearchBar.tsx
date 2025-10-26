"use client";

import { useState, useEffect, useRef } from 'react';
import { useDebounce } from 'react-use';
import { Input } from '@/components/ui/input';
import { SearchResultDropdown } from './SearchResultDropdown';
import { useNaverSearch } from '../hooks/useNaverSearch';
import { SEARCH_CONFIG } from '../lib/constants';

export const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useDebounce(
    () => {
      setDebouncedQuery(searchQuery);
      setIsDropdownOpen(searchQuery.trim().length > 0);
    },
    SEARCH_CONFIG.DEBOUNCE_MS,
    [searchQuery]
  );

  const { data: searchResults, isLoading } = useNaverSearch(
    debouncedQuery,
    debouncedQuery.trim().length > 0
  );

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClose = () => {
    setIsDropdownOpen(false);
    setSearchQuery('');
    setDebouncedQuery('');
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <Input
        type="text"
        placeholder="음식점 검색..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full"
      />
      {isDropdownOpen && (
        <SearchResultDropdown
          results={searchResults?.items || []}
          isLoading={isLoading}
          onClose={handleClose}
        />
      )}
    </div>
  );
};

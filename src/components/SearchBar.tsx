"use client"
import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FIND_FIRST_ENS_NAME } from '@/graphql/queries/getWalletByName';
import debounce from 'lodash/debounce';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface EnsNameSearchProps {
  graphql: string;
}

export function EnsNameSearch({ graphql }: EnsNameSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce function
  const debouncedSetSearch = useCallback(
    debounce((value: string) => {
      setDebouncedSearchTerm(value);
    }, 300),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSetSearch(value);
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['ensName', debouncedSearchTerm],
    queryFn: async () => {
      if (!debouncedSearchTerm) return null;
      const response = await fetch(graphql, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: FIND_FIRST_ENS_NAME,
          variables: {
            where: {
              name: {
                contains: debouncedSearchTerm
              }
            }
          }
        }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    enabled: !!debouncedSearchTerm // Only run the query if there's a search term
  });

  return (
    <div className="relative">
      <div className="relative">
        <Input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search ENS name"
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
      </div>
      {isLoading && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
          <p className="p-2 text-sm text-gray-500">Loading...</p>
        </div>
      )}
      {error && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
          <p className="p-2 text-sm text-red-500">Error: {error.message}</p>
        </div>
      )}
      {data && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
          {data.data && data.data.findFirstEnsName ? (
            <div className="p-2">
              <p className="text-sm">{data.data.findFirstEnsName.name}</p>
            </div>
          ) : (
            <p className="p-2 text-sm text-gray-500">No result found, try using an address instead</p>
          )}
        </div>
      )}
    </div>
  );
}
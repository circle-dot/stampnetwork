"use client"
import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FIND_FIRST_ENS_NAME } from '@/graphql/queries/getWalletByName';
import debounce from 'lodash/debounce';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import VouchButtonCustom from './VouchButtonWithDialog';

interface EnsNameSearchProps {
  graphql: string;
  schema: string;
  chain: string;
  platform: string;
  verifyingContract: string;
}

export function EnsNameSearch({ graphql, schema, chain, platform, verifyingContract }: EnsNameSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedName, setSelectedName] = useState<string | null>(null);

  // Debounce function
  const debouncedSetSearch = useCallback((value: string) => {
    const debouncedFunction = debounce((searchValue: string) => {
      setDebouncedSearchTerm(searchValue);
    }, 300);
    debouncedFunction(value);
  }, []);

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
              <p 
                className="text-sm cursor-pointer hover:text-blue-500"
                onClick={() => setSelectedName(data.data.findFirstEnsName.name)}
              >
                {data.data.findFirstEnsName.name}
              </p>
              {selectedName && (
                <VouchButtonCustom
                  recipient={data.data.findFirstEnsName.id}
                  className="mt-2"
                  graphqlEndpoint={graphql}
                  schema={schema}
                  chain={chain}
                  platform={platform}
                  verifyingContract={verifyingContract}
                />
              )}
            </div>
          ) : (
            <p className="p-2 text-sm text-gray-500">No result found, try using a full address instead</p>
          )}
        </div>
      )}
    </div>
  );
}
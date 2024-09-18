"use client"
import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FIND_FIRST_ENS_NAME } from '@/graphql/queries/getWalletByName';
import debounce from 'lodash/debounce';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ethers } from 'ethers';
import { Dialog } from "@/components/ui/dialog";
import { UserProfileCard } from './UserProfileCard';
interface EnsNameSearchProps {
  graphql: string;
  platform: string;
}

export function EnsNameSearch({ graphql, platform }: EnsNameSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isEthAddress, setIsEthAddress] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  console.log("GraphQL:", graphql);
  
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
    setIsEthAddress(ethers.isAddress(value));
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

  const handleVouch = () => {
    // Handle vouch action here if needed
    setIsDialogOpen(false);
  };

  const handleNameClick = () => {
    setIsDialogOpen(true);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search ENS or Address"
          className="pl-10 block w-full bg-background border border-secondary rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
      </div>
      {isLoading && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg bg-background">
          <p className="p-2 text-sm text-gray-500">Loading...</p>
        </div>
      )}
      {error && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg bg-background">
          <p className="p-2 text-sm text-red-500">Error: {error.message}</p>
        </div>
      )}
      {(data || isEthAddress) && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg bg-background">
          {data?.data?.findFirstEnsName ? (
            <div className="p-2">
              <p 
                className="text-sm cursor-pointer text-primary hover:text-blue-500"
                onClick={() => handleNameClick()}
              >
                {data.data.findFirstEnsName.name}
              </p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <UserProfileCard
                  recipient={data.data.findFirstEnsName.id}
                  onVouch={handleVouch}
                  onCancel={() => setIsDialogOpen(false)}
                  graphqlEndpoint={graphql}
                  platform={platform}  
                />
              </Dialog>
            </div>
          ) : isEthAddress ? (
            <div className="p-2">
              <p 
                className="text-sm cursor-pointer text-primary hover:text-blue-500"
                onClick={() => handleNameClick()}
              >
                {searchTerm} (Valid Ethereum address)
              </p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <UserProfileCard
                  recipient={searchTerm}
                  onVouch={handleVouch}
                  onCancel={() => setIsDialogOpen(false)}
                  graphqlEndpoint={graphql}
                  platform={platform}  
                />
              </Dialog>
            </div>
          ) : (
            <p className="p-2 text-sm text-gray-500">No result found</p>
          )}
        </div>
      )}
    </div>
  );
}
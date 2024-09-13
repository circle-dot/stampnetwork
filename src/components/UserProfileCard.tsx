"use client"
import React, { useState, useEffect } from 'react';
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery } from '@tanstack/react-query';
import { FIND_FIRST_ENS_NAME } from '@/graphql/queries/getWalletByName';
import COUNT_ATTESTATIONS_RECEIVED from '@/graphql/queries/AttestationsReceivedCount';
import COUNT_ATTESTATIONS_MADE from '@/graphql/queries/AttestationsMadeCount';
import { ethers } from 'ethers';
import { Skeleton } from "@/components/ui/skeleton";
import { Copy } from 'lucide-react';
import { showCopySuccessAlert } from '@/utils/alertUtils';
import Avatar from 'boring-avatars';

interface UserProfileCardProps {
  recipient: string;
  onVouch: () => void;
  onCancel: () => void;
  graphqlEndpoint: string;
  platform:string;
}

export function UserProfileCard({ recipient, onVouch, onCancel, graphqlEndpoint,platform }: UserProfileCardProps) {
  const [ensName, setEnsName] = useState<string | null>(null);
  const formattedRecipient = ethers.getAddress(recipient);
  const { data: ensData, isLoading: isEnsLoading } = useQuery({
    queryKey: ['ensName', formattedRecipient],
    queryFn: async () => {
      const response = await fetch(graphqlEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: FIND_FIRST_ENS_NAME,
          variables: { 
            where: { 
              id: { contains: formattedRecipient.toLowerCase() } 
            } 
          },
        }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
  });

  const { data: vouchesReceived, isLoading: isVouchesReceivedLoading } = useQuery({
    queryKey: ['vouchesReceived', formattedRecipient],
    queryFn: async () => {
      const response = await fetch(graphqlEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: COUNT_ATTESTATIONS_RECEIVED,
          variables: { 
            where: { 
              recipient: { equals: formattedRecipient },
              decodedDataJson: { contains: platform }
            } 
          },
        }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
  });
  const { data: vouchesMade, isLoading: isVouchesMadeLoading } = useQuery({
    queryKey: ['vouchesMade', formattedRecipient],
    queryFn: async () => {
      const response = await fetch(graphqlEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: COUNT_ATTESTATIONS_MADE,
          variables: { 
            where: { 
              attester: { equals: formattedRecipient },
              decodedDataJson: { contains: platform }
            } 
          },
        }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
  });

  useEffect(() => {
    if (ensData?.data?.findFirstEnsName) {
      setEnsName(ensData.data.findFirstEnsName.name);
    }
  }, [ensData]);

  const isLoading = isEnsLoading || isVouchesReceivedLoading || isVouchesMadeLoading;
  const receivedCount = vouchesReceived?.data?.aggregateAttestation?._count?.recipient || 0;
  const madeCount = vouchesMade?.data?.aggregateAttestation?._count?.attester || 0;

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showCopySuccessAlert();
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>User Profile</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="flex items-center gap-4">
          {isLoading ? (
            <Skeleton className="h-16 w-16 rounded-full" />
          ) : (
            <Avatar
              size={64}
              name={ensName || formattedRecipient}
              variant="beam"
              className="rounded-full"
            />
          )}
          <div className="flex-grow">
            {isLoading ? (
              <Skeleton className="h-6 w-full" />
            ) : (
              <div className="flex items-center justify-between">
                <span className="font-semibold text-lg truncate">
                  {ensName || truncateAddress(formattedRecipient)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(formattedRecipient)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            )}
            <span className="text-xs text-gray-500 break-all">{formattedRecipient}</span>
          </div>
        </div>


        <div className="grid grid-cols-4 items-center gap-4">
          <span className="col-span-2">Vouches Received:</span>
          {isLoading ? (
            <Skeleton className="h-4 w-16 col-span-2" />
          ) : (
            <span className="col-span-2">{receivedCount}</span>
          )}
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <span className="col-span-2">Vouches Made:</span>
          {isLoading ? (
            <Skeleton className="h-4 w-16 col-span-2" />
          ) : (
            <span className="col-span-2">{madeCount}</span>
          )}
        </div>
        <div className="flex justify-end space-x-2">
          <Button onClick={onCancel} variant="outline">Cancel</Button>
          <Button onClick={onVouch} disabled={isLoading}>Vouch for this user</Button>
        </div>
      </div>
    </DialogContent>
  );
}
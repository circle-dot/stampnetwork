"use client"
import React, { useState, useEffect } from 'react';
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery } from '@tanstack/react-query';
import COUNT_ATTESTATIONS_RECEIVED from '@/graphql/queries/AttestationsReceivedCount';
import COUNT_ATTESTATIONS_MADE from '@/graphql/queries/AttestationsMadeCount';
import { ethers } from 'ethers';
import { Skeleton } from "@/components/ui/skeleton";
import { Copy } from 'lucide-react';
import { showCopySuccessAlert } from '@/utils/alertUtils';
import Avatar from 'boring-avatars';
import { usePrivy } from '@privy-io/react-auth';
import { useEnsName } from '@/utils/hooks/useEnsName';

interface UserProfileDialogProps {
  graphqlEndpoint: string;
}

export function UserProfileDialog({ graphqlEndpoint }: UserProfileDialogProps) {
  const { ready, authenticated, user } = usePrivy();
  const [formattedAddress, setFormattedAddress] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (ready && authenticated && user?.wallet?.address) {
      setFormattedAddress(ethers.getAddress(user.wallet.address));
    } else {
      setFormattedAddress(undefined);
    }
  }, [ready, authenticated, user]);

  const { data: ensName, isLoading: isEnsLoading } = useEnsName(formattedAddress);

  const { data: vouchesReceived, isLoading: isVouchesReceivedLoading } = useQuery({
    queryKey: ['vouchesReceived', formattedAddress],
    queryFn: async () => {
      if (!formattedAddress) return null;
      const response = await fetch(graphqlEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: COUNT_ATTESTATIONS_RECEIVED,
          variables: { 
            where: { 
              recipient: { equals: formattedAddress } 
            } 
          },
        }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    enabled: !!formattedAddress,
  });

  const { data: vouchesMade, isLoading: isVouchesMadeLoading } = useQuery({
    queryKey: ['vouchesMade', formattedAddress],
    queryFn: async () => {
      if (!formattedAddress) return null;
      const response = await fetch(graphqlEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: COUNT_ATTESTATIONS_MADE,
          variables: { 
            where: { 
              attester: { equals: formattedAddress } 
            } 
          },
        }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    enabled: !!formattedAddress,
  });

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

  if (!ready || !authenticated || !formattedAddress) {
    return <DialogContent>Loading...</DialogContent>;
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Your Profile</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="flex items-center gap-4">
          {isLoading ? (
            <Skeleton className="h-16 w-16 rounded-full" />
          ) : (
            <Avatar
              size={64}
              name={ensName || formattedAddress}
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
                  {ensName || (formattedAddress ? truncateAddress(formattedAddress) : 'No address')}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(formattedAddress)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            )}
            <span className="text-xs text-gray-500 break-all">{formattedAddress}</span>
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
      </div>
    </>
  );
}
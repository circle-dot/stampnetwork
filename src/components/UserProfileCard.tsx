"use client"
import React, { useState, useEffect } from 'react';
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery } from '@tanstack/react-query';
import { FIND_FIRST_ENS_NAME } from '@/graphql/queries/getWalletByName';
import COUNT_ATTESTATIONS_RECEIVED from '@/graphql/queries/AttestationsReceivedCount';
import COUNT_ATTESTATIONS_MADE from '@/graphql/queries/AttestationsMadeCount';
import { ethers } from 'ethers';

interface UserProfileCardProps {
  recipient: string;
  onVouch: () => void;
  onCancel: () => void;
  graphqlEndpoint: string;
}

export function UserProfileCard({ recipient, onVouch, onCancel, graphqlEndpoint }: UserProfileCardProps) {
  const [ensName, setEnsName] = useState<string | null>(null);
console.log('re', recipient)
const formattedRecipient = ethers.getAddress(recipient);
  const { data: ensData } = useQuery({
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
              id: { contains: recipient } 
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



  const { data: vouchesReceived } = useQuery({
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
              recipient: { equals: formattedRecipient } 
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

  const { data: vouchesMade } = useQuery({
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
              attester: { equals: formattedRecipient } 
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

  const displayName = ensName || recipient;
  const receivedCount = vouchesReceived?.data?.aggregateAttestation?._count?.recipient || 0;
  const madeCount = vouchesMade?.data?.aggregateAttestation?._count?.attester || 0;

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>User Profile</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <span className="col-span-4 font-semibold text-lg">{displayName}</span>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <span className="col-span-2">Vouches Received:</span>
          <span className="col-span-2">{receivedCount}</span>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <span className="col-span-2">Vouches Made:</span>
          <span className="col-span-2">{madeCount}</span>
        </div>
        <div className="flex justify-end space-x-2">
          <Button onClick={onCancel} variant="outline">Cancel</Button>
          <Button onClick={onVouch}>Vouch for this user</Button>
        </div>
      </div>
    </DialogContent>
  );
}
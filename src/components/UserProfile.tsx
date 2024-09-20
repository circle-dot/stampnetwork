import React, { useState, useEffect } from 'react';
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ethers } from 'ethers';
import { Skeleton } from "@/components/ui/skeleton";
import { Copy } from 'lucide-react';
import { showCopySuccessAlert } from '@/utils/alertUtils';
import Avatar from 'boring-avatars';
import { usePrivy } from '@privy-io/react-auth';
import { useEnsName } from '@/utils/hooks/useEnsName';
import { useAttestationCounts } from '@/utils/hooks/useAttestationCount';

interface UserProfileProps {
  isOwnProfile: boolean;
  recipient?: string;
  onVouch?: () => void;
  onCancel?: () => void;
  graphqlEndpoint: string;
  platform?: string;
  isAuthenticated: boolean;
}

export function UserProfile({
  isOwnProfile,
  recipient,
  onVouch,
  onCancel,
  graphqlEndpoint,
  platform,
  isAuthenticated
}: UserProfileProps) {
  const { ready, authenticated, user } = usePrivy();
  const [formattedAddress, setFormattedAddress] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isOwnProfile && ready && authenticated && user?.wallet?.address) {
      setFormattedAddress(ethers.getAddress(user.wallet.address));
    } else if (!isOwnProfile && recipient) {
      setFormattedAddress(ethers.getAddress(recipient));
    }
  }, [isOwnProfile, ready, authenticated, user, recipient]);

  const { data: ensName, isLoading: isEnsLoading } = useEnsName(formattedAddress);

  const { vouchesReceived, vouchesMade, isLoading: isAttestationsLoading } = useAttestationCounts(
    graphqlEndpoint,
    formattedAddress,
    ethers.encodeBytes32String(platform || '')
  );

  const isLoading = isEnsLoading || isAttestationsLoading;
  const receivedCount = vouchesReceived?.data?.aggregateAttestation?._count?.recipient ?? 0;
  const madeCount = vouchesMade?.data?.aggregateAttestation?._count?.attester ?? 0;

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showCopySuccessAlert();
  };

  if (!formattedAddress) {
    return <DialogContent>Loading...</DialogContent>;
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{isOwnProfile ? "Your Profile" : "User Profile"}</DialogTitle>
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
                  {ensName || truncateAddress(formattedAddress)}
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
        {!isOwnProfile && (
          <div className="flex justify-end space-x-2">
            <Button onClick={isAuthenticated ? onVouch : () => onVouch?.()} variant={isAuthenticated ? "default" : "outline"}>
              {isAuthenticated ? "Vouch" : "Login to Vouch"}
            </Button>
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        )}
      </div>
    </DialogContent>
  );
}
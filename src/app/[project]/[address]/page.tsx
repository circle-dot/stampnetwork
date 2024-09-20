'use client';
import React from 'react';
import { useAttestationDetails } from '@/utils/hooks/useAttestationDetails';
import { useAttestationCounts } from '@/utils/hooks/useAttestationCount';
import { useEnsName } from '@/utils/hooks/useEnsName';
import { EAS_CONFIG } from '../../../../config/siteConfig';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Avatar from 'boring-avatars';
import { Copy } from 'lucide-react';
import { showCopySuccessAlert } from '@/utils/alertUtils';
import { ethers } from 'ethers';
import Image from 'next/image';
import communityData from "@/data/communityData.json";
import VouchButton from '@/components/VouchButton';
import Link from 'next/link';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Loading from '@/app/loading';

export default function AddressPage({ params }: { params: { project: string, address: string } }) {
  const { project, address: rawAddress } = params;
  const address = ethers.getAddress(rawAddress);
  const community = communityData[project as keyof typeof communityData];
  const graphqlEndpoint = EAS_CONFIG.GRAPHQL_URL;
  const { attestations, isLoading: isAttestationsLoading, error: attestationsError } = useAttestationDetails(graphqlEndpoint, address, ethers.encodeBytes32String(project), 3);
  const { vouchesReceived, vouchesMade, isLoading: isCountsLoading } = useAttestationCounts(graphqlEndpoint, address, ethers.encodeBytes32String(project));
  const { data: ensName, isLoading: ensLoading } = useEnsName(address);

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    showCopySuccessAlert();
  };

  if (isAttestationsLoading || isCountsLoading || ensLoading) return <Loading />;
  if (attestationsError) return <div>Error: {attestationsError.message}</div>;

  const receivedCount = vouchesReceived?.data?.aggregateAttestation?._count?.recipient ?? 0;
  const madeCount = vouchesMade?.data?.aggregateAttestation?._count?.attester ?? 0;

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Community header */}
        <Link href={`/${project}`}>
          <div className="flex items-center justify-center mb-8">
            <Image
              src={community.roles[0].image}
              alt={community.name}
              width={80}
              height={80}
              className="rounded-full mr-4"
            />
            <h1 className="text-2xl font-bold">{community.name}</h1>
          </div>
        </Link>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar - on top for mobile, left side for desktop */}
          <div className="w-full md:w-1/4">
            <Card className="md:sticky md:top-4">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center mb-4">
                  <Avatar
                    size={80}
                    name={address}
                    variant="beam"
                  />
                  <h2 className="text-2xl font-bold mt-2">
                    {ensName || truncateAddress(address)}
                  </h2>
                  <div className="flex items-center mt-1">
                    <span className="text-sm text-gray-500 mr-2">
                      {truncateAddress(address)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyAddress}
                      className="p-1"
                    >
                      <Copy size={16} />
                    </Button>
                  </div>
                </div>
                
                {/* Attestation Counts */}
                <div className="mt-4 mb-4 text-center">
                  <p>Vouches Received: {receivedCount}</p>
                  <p>Vouches Made: {madeCount}</p>
                </div>

                <VouchButton
                  recipient={address}
                  className="mb-4"
                  schema={community.schema}
                  chain={community.chainId.toString()}
                  platform={community.id}
                  verifyingContract={community.verifyingContract}
                  buttonText='Vouch for this user'
                />
              </CardContent>
            </Card>
          </div>

          {/* Main content */}
          <div className="w-full md:w-3/4">
            <Card>
              <CardContent>
                <h3 className="text-lg font-semibold mt-4 mb-2">Latest Vouches in {project}</h3>
                {attestations && attestations.length > 0 ? (
                  <ScrollArea className="h-[120px] w-full rounded-xl border">
                    <div className="p-4">
                      {attestations.map((attestation: any) => (
                        <div key={attestation.id} className="mb-4 pb-4 border-b last:mb-0 last:pb-0 last:border-b-0">
                          <p className="font-semibold">Vouched for:</p>
                          <Link href={`/${project}/${attestation.recipient}`}><p className="text-sm text-primary">{truncateAddress(attestation.recipient)}</p></Link>
                          <p className="text-xs text-gray-400">
                            {new Date(attestation.timeCreated * 1000).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <p>No recent vouches in this community.</p>
                )}

                {/* Other Communities Section */}
                <h3 className="text-lg font-semibold mt-6 mb-2">This user in other communities</h3>
                <ScrollArea className="w-full whitespace-nowrap rounded-xl border">
                  <div className="flex w-max space-x-4 p-4">
                    {Object.entries(communityData).map(([key, community]) => {
                      if (key !== project) {
                        return (
                          <Link href={`/${key}/${address}`} key={key}>
                            <div className="flex flex-col items-center space-y-2">
                              <Image
                                src={community.roles[0].image}
                                alt={community.name}
                                width={64}
                                height={64}
                                className="rounded-full"
                              />
                              <span className="text-sm font-medium">{community.name}</span>
                            </div>
                          </Link>
                        );
                      }
                      return null;
                    })}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
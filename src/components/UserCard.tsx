import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import VouchButtonCustom from './VouchButtonWithDialog';

interface UserCardProps {
  recipient: string;
  communityData: any;
}

export function UserCard({ recipient, communityData }: UserCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm font-medium mb-2 truncate">{recipient}</p>
        <VouchButtonCustom
          recipient={recipient}
          graphqlEndpoint={communityData.graphql}
          schema={communityData.schema}
          chain={communityData.chainId.toString()}
          platform={communityData.id}
          verifyingContract={communityData.verifyingContract}
        />
      </CardContent>
    </Card>
  );
}
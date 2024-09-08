import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import VouchButtonCustom from './VouchButtonWithDialog';
import Avatar from 'boring-avatars';
interface UserCardProps {
  recipient: string;
  communityData: any;
}

export function UserCard({ recipient, communityData }: UserCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center mb-2">
          <Avatar name={recipient} variant="beam" size={40} className="mr-2" />
          <p className="text-sm font-medium truncate">{recipient}</p>
        </div>
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
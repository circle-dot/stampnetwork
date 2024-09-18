import { NextRequest, NextResponse } from 'next/server';
import ATTESTATIONS_PRETRUST_CHECK from '@/graphql/queries/AttestationsPretrustCheck';
import { ethers } from 'ethers';

function stringToBytes32(str: string): string {
    // Pad the string to 32 bytes
    const paddedStr = str.padEnd(32, '\0');
    // Convert to hex
    return '0x' + Buffer.from(paddedStr).toString('hex');
}

export async function POST(request: NextRequest) {
    const { semaphoreId, ticketType, walletAddress, email, graphqlEndpoint, platform } = await request.json();
    const formattedRecipient = ethers.getAddress(walletAddress);

    try {
        const response = await fetch(graphqlEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: ATTESTATIONS_PRETRUST_CHECK,
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

        const data = await response.json();
        const attestations = data.data.attestations; // Adjust this based on your GraphQL response structure

        // Continue with the rest of your logic using the attestations data
        // ...
    } catch (error) {
        console.error('Error checking attestations:', error);
        return NextResponse.json({ error: 'Failed to check attestations' }, { status: 500 });
    }
}
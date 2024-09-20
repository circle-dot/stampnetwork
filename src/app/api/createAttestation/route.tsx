import { NextRequest, NextResponse } from 'next/server';
import privy from '@/lib/privy';
import { EAS, SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';
import { ethers } from 'ethers';
import { toBigInt } from 'ethers';
import { Utils } from 'alchemy-sdk';

import communityData from '@/data/communityData.json';

const PRIVATE_KEY = process.env.PRIVATE_KEY!;
const ALCHEMY_URL = process.env.ALCHEMY_URL!;

const provider = new ethers.JsonRpcProvider(ALCHEMY_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

export async function POST(request: NextRequest) {
    try {
        // Verify Privy token
        const authorization = request.headers.get('authorization');

        if (!authorization || typeof authorization !== 'string') {
            console.error('Authorization header is missing or invalid');
            return NextResponse.json({ error: 'Authorization header missing or invalid' }, { status: 401 });
        }

        let verifiedClaims;
        try {
            verifiedClaims = await privy.verifyAuthToken(authorization);
            console.log('Verified claims:', verifiedClaims);
        } catch (error) {
            console.error('Token verification failed:', error);
            return NextResponse.json({ error: 'Token verification failed' }, { status: 401 });
        }

        // Extract user data from request body
        const { platform, recipient, attester, signature } = await request.json();
        console.log('Request data:', { platform, recipient, attester });

        // Fetch community info from communityData
        const communityInfo = communityData[platform as keyof typeof communityData];
        if (!communityInfo) {
            return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
        }

        const easContractAddress = communityInfo.verifyingContract;
        const schemaUID = communityInfo.schema;

        // Initialize EAS with the platform-specific contract address
        const eas = new EAS(easContractAddress);
        await eas.connect(signer);

        // Encode the data using SchemaEncoder
        const schemaEncoder = new SchemaEncoder("bytes32 endorsement,bytes32 platform,bytes32 category");
        const encodedData = schemaEncoder.encodeData([
            { name: "endorsement", value: ethers.encodeBytes32String(communityInfo.endorsementType), type: "bytes32" },
            { name: "platform", value: ethers.encodeBytes32String(platform), type: "bytes32" },
            { name: "category", value: ethers.encodeBytes32String(communityInfo.category), type: "bytes32" }
        ]);

        const flatSig = signature;
        const expandedSig = Utils.splitSignature(flatSig);
        console.log('Expanded signature:', expandedSig);

        // Create the delegated attestation
        const transaction = await eas.attestByDelegation({
            schema: schemaUID,
            data: {
                recipient: recipient,
                expirationTime: toBigInt(0),
                revocable: true,
                refUID: '0x0000000000000000000000000000000000000000000000000000000000000000',
                data: encodedData
            },
            signature: expandedSig,
            attester: attester,
            deadline: toBigInt(0)
        });

        const newAttestationUID = await transaction.wait();
        console.log('New attestation UID:', newAttestationUID);

        // Return success response with the newly created attestation UID
        return NextResponse.json({ newAttestationUID });
    } catch (error) {
        console.error('Error creating attestation:', error);
        // Return error response if something goes wrong
        return NextResponse.json({ error: 'Failed to create attestation' }, { status: 500 });
    }
}
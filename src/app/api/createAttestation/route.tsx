import { NextRequest, NextResponse } from 'next/server';
import privy from '@/lib/privy';
import { EAS, SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';
import { ethers } from 'ethers';
import { toBigInt } from 'ethers';
import { Utils } from 'alchemy-sdk';
const easContractAddress = "0x4200000000000000000000000000000000000021";
const schemaUID = process.env.SCHEMA_ID || "0x5ee00c7a6606190e090ea17749ec77fe23338387c23c0643c4251380f37eebc3";

const eas = new EAS(easContractAddress);
// Signer must be an ethers-like signer.
const PRIVATE_KEY = process.env.PRIVATE_KEY!;
const ALCHEMY_URL = process.env.ALCHEMY_URL!;

const provider = new ethers.JsonRpcProvider(ALCHEMY_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);
await eas.connect(signer);

import communityData from '@/data/communityData.json';

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
             console.log('verifiedClaims', verifiedClaims);
        } catch (error) {
            console.error('Token verification failed:', error);
            return NextResponse.json({ error: 'Token verification failed' }, { status: 401 });
        }

        // Extract user data from request body
        const { platform, recipient, attester, signature } = await request.json();

        // Fetch endorsementType and power from communityData
        const communityInfo = communityData[platform as keyof typeof communityData];
        if (!communityInfo) {
            return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
        }

        // Check if the recipient is the same as the attester
        if (recipient === attester) {
            return NextResponse.json({ error: "You can't vouch yourself." }, { status: 400 });
        }
        // Encode the data using SchemaEncoder
        const schemaEncoder = new SchemaEncoder("uint8 power,string endorsementType,string platform");
        const encodedData = schemaEncoder.encodeData([
            { name: "power", value: communityInfo.power, type: "uint8" },
            { name: "endorsementType", value: communityInfo.endorsementType, type: "string" },
            { name: "platform", value: platform, type: "string" }
        ]);
        //! TO DO maybe remove some hardcoded values?
   
        const flatSig = signature;
        // console.log('Signature', flatSig);
        const expandedSig = Utils.splitSignature(flatSig);
        console.log('expandedSig', expandedSig);

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

        // console.log('New attestation UID:', newAttestationUID);
        // console.log('Transaction receipt:', transaction.receipt);
/*         try {
            const result = await updateEigenScore();
            console.log('Data updated successfully:', result);
            // Handle result if needed
        } catch (error) {
            console.error('Error updating eigenScore:', error);
        } */
        // Return success response with the newly created attestation UID
        return NextResponse.json({ newAttestationUID });
    } catch (error) {
        console.error('Error creating attestation:', error);
        // Return error response if something goes wrong
        return NextResponse.json({ error: 'Failed to create attestation' }, { status: 500 });
    }
}
import generateAttestation from '@/utils/generateAttestation';
import { signTypedData } from '@/utils/signTypedData';
import fetchNonce from '@/utils/fetchNonce';
import { showLoadingAlert, showErrorAlert, showSuccessAlert } from '@/utils/alertUtils';
import { SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';
import communityData from '@/data/communityData.json';

export const handleVouch = async (
    recipient: string,
    user: any,
    wallets: any,
    getAccessToken: any,
    schema: string,
    chain: string,
    platform: string,
    verifyingContract: string
) => {
    if (!user?.wallet?.address) {
        showErrorAlert('User wallet address is not defined.');
        return;
    }

    if (recipient === user.wallet.address) {
        showErrorAlert("You can't vouch yourself.");
        return;
    }

    const nonce = await fetchNonce(user.wallet.address);

    if (nonce === undefined) {
        showErrorAlert('Failed to fetch nonce.');
        return;
    }

    showLoadingAlert();

    try {
        const token = await getAccessToken();
        if (!token) {
            showErrorAlert('Something went wrong. Try reloading the page.');
            return;
        }

        const chainId = parseInt(chain);
        const schemaUID = schema;
        const attester = user?.wallet.address;
        console.log('attester', attester);
        console.log('platform', platform);
         // Fetch endorsementType and power from communityData
         const communityInfo = communityData[platform as keyof typeof communityData];
         if (!communityInfo) {
             console.log('communityInfo', communityInfo);
         }
         // Use default values if endorsementType or power are not defined
         const endorsementType = 'endorsementType' in communityInfo ? communityInfo.endorsementType : "Default";
         const power = 'power' in communityInfo ? communityInfo.power : "1";
         console.log('endorsementType', endorsementType)
         console.log('power',power)
         const schemaEncoder = new SchemaEncoder("uint8 power,string endorsementType,string platform");
         const encodedData = schemaEncoder.encodeData([
            { name: "power", value: power, type: "uint8" },
            { name: "endorsementType", value: endorsementType, type: "string" },
            { name: "platform", value: platform, type: "string" }
        ]);
        const domain = {
            name: 'EAS',
            version: '1.2.0',
            chainId: chainId,
            verifyingContract: verifyingContract
        };

        const types = {
            Attest: [
                { name: 'schema', type: 'bytes32' },
                { name: 'recipient', type: 'address' },
                { name: 'expirationTime', type: 'uint64' },
                { name: 'revocable', type: 'bool' },
                { name: 'refUID', type: 'bytes32' },
                { name: 'data', type: 'bytes' },
                { name: 'value', type: 'uint256' },
                { name: 'nonce', type: 'uint256' },
                { name: 'deadline', type: 'uint64' }
            ]
        };

        const value = {
            schema: schemaUID,
            recipient: recipient,
            expirationTime: 0,
            revocable: true,
            refUID: '0x0000000000000000000000000000000000000000000000000000000000000000',
            data: encodedData,
            deadline: 0,
            value: 0,
            nonce: nonce
        };

        const typedData = {
            types: types,
            domain: domain,
            primaryType: 'Attest',
            message: value,
        };
        const signature = await signTypedData(user, wallets, chainId, typedData);


        //TO CONSIDER, we can pass encoded data instead of doing it server side as well, but should we?
        const resultAttestation = await generateAttestation(token, platform, recipient, attester, signature);
        console.log('resultAttestation:', resultAttestation);

        // Construct the attestation view URL
        const baseUrl = communityInfo.graphql.replace('/graphql', '');
        const attestationViewUrl = `${baseUrl}/attestation/view/${resultAttestation.newAttestationUID}`;

        showSuccessAlert('Vouch created successfully.', 'Go to vouch', attestationViewUrl);

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        if (errorMessage === '550') {
            showErrorAlert("You don't have any vouches available.");
        } else if (errorMessage === "You can't vouch yourself.") {
            showErrorAlert("You can't vouch yourself.");
        } else {
            showErrorAlert('An error occurred while creating the vouch.');
        }
    }
};

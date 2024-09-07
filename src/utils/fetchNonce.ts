const fetchNonce = async (wallet: string) => {
    // console.log('wallet!', wallet);
    const response = await fetch(`/api/getNonce?attester=${wallet}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Error fetching EAS nonce');
    }

    const data = await response.json();
    // console.log('Fetched nonce data:', data);
    return data.easNonce;
};
export default fetchNonce
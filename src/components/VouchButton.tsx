"use client"
import React, { useState, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { handleVouch } from '@/utils/handleAttestation';

interface VouchButtonProps {
    recipient: string;
    className?: string;
    graphqlEndpoint: string;
    schema: string;
    chain: string;
    platform: string;
    verifyingContract: string;
    buttonText?: string;
}

const VouchButton: React.FC<VouchButtonProps> = ({
    recipient,
    className,
    graphqlEndpoint,
    schema,
    chain,
    platform,
    verifyingContract,
    buttonText = 'Vouch'
}) => {
    const { getAccessToken, user, login, authenticated, ready } = usePrivy();
    const [authStatus, setAuthStatus] = useState(false);
    const { wallets } = useWallets();

    useEffect(() => {
        if (ready) {
            setAuthStatus(authenticated);
        }
    }, [ready, authenticated]);

    const handleClick = async () => {
        if (!authStatus) {
            await login();
            return;
        }
        
        handleVouch(recipient, user, wallets, getAccessToken, schema, chain, platform, verifyingContract);
    };

    const buttonStyles = `inline-flex w-full items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 px-6 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-50 ${className}`;

    return (
        <Button className={buttonStyles} onClick={handleClick}>
            {buttonText}
        </Button>
    );
};

export default VouchButton;
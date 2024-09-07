"use client"
import React, { useState, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { handleVouch } from '@/utils/handleAttestation';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { UserProfileCard } from './UserProfileCard';

interface VouchButtonCustomProps {
    recipient: string;
    className?: string;
    graphqlEndpoint: string;
    schema: string;
    chain: string;
    platform: string;
    verifyingContract: string;
}

const VouchButtonCustom: React.FC<VouchButtonCustomProps> = ({ recipient, className, graphqlEndpoint, schema, chain, platform, verifyingContract }) => {
    
    const { getAccessToken, user, login, authenticated, ready } = usePrivy();
    const [authStatus, setAuthStatus] = useState(false);
    const { wallets } = useWallets();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    useEffect(() => {
        if (ready) {
            setAuthStatus(authenticated);
        }
    }, [ready, authenticated]);
    const handleVouchConfirm = () => {
        handleVouch(recipient, user, wallets, getAccessToken, schema, chain, platform, verifyingContract);
        setIsDialogOpen(false);
    };

    const buttonStyles = `inline-flex w-full hover:animate-shimmer items-center justify-center rounded-md border border-gray-300 bg-[linear-gradient(110deg,#ffffff,45%,#f0f0f0,55%,#ffffff)] bg-[length:200%_100%] px-6 font-medium text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-50 ${className}`;

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button className={buttonStyles}>
                    Vouch
                </Button>
            </DialogTrigger>
            <DialogContent>
                {authStatus ? (
                    <>
                        <DialogTitle className='hidden'>User profile</DialogTitle>
                        <DialogDescription className='hidden'>
                            This card displays the information of the user profile
                        </DialogDescription>
                        <UserProfileCard
                            recipient={recipient}
                            onVouch={handleVouchConfirm}
                            onCancel={() => setIsDialogOpen(false)}
                            graphqlEndpoint={graphqlEndpoint}
                        />
                    </>
                ) : (
                    <>
                        <DialogTitle>Login Required</DialogTitle>
                        <DialogDescription>
                            You need to be logged in to vouch for a user.
                        </DialogDescription>
                        <DialogFooter>
                            <Button onClick={() => { login(); setIsDialogOpen(false); }}>
                                Log In
                            </Button>
                            <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default VouchButtonCustom;

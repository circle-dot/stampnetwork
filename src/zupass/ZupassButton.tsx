"use client";

import { useZuAuth } from './zuauthLogic';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useState } from 'react';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { matchTicketToType, whitelistedTickets } from './zupass-config';
import useAttestationCheck from '../utils/hooks/useAttestationCheck';

export function ZuAuthButton({ user, wallets }: { user: any, wallets: any }) {
    const { handleZuAuth, isLoading, result, handleSign } = useZuAuth(user);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [signingStates, setSigningStates] = useState<{ [key: string]: boolean }>({});

    const onZuAuth = async () => {
        await handleZuAuth();
        setIsDialogOpen(true);
    };

    const handleSignWithLoading = async (pcdData: any, index: number) => {
        setSigningStates(prev => ({ ...prev, [index]: true }));
        try {
            console.log("pcdData", pcdData);
            console.log("wallets", wallets);
            console.log("user", user);
            await handleSign(pcdData, wallets, user);
        } finally {
            setSigningStates(prev => ({ ...prev, [index]: false }));
        }
    };

    const semaphoreIds = result?.pcds?.map((pcd: any) => {
        const pcdData = JSON.parse(pcd.pcd);
        return pcdData.claim?.partialTicket?.attendeeSemaphoreId;
    }) || [];

    const { data: attestationData, isLoading: isAttestationLoading, error: attestationError } = useAttestationCheck(semaphoreIds);

    const renderPcdInfo = (pcdWrapper: any, index: number) => {
        try {
            const pcdData = JSON.parse(pcdWrapper.pcd);
            const semaphoreId = pcdData.claim?.partialTicket?.attendeeSemaphoreId;

            const attestation = attestationData?.find((att: any) => att.decodedDataJson.includes(semaphoreId));

            const eventId = pcdData.claim?.partialTicket?.eventId || "Not specified";
            const productId = pcdData.claim?.partialTicket?.productId || "Not specified";

            const ticketType = matchTicketToType(eventId, productId);
            const ticketInfo = ticketType ? whitelistedTickets[ticketType].find(t => t.eventId === eventId && t.productId === productId) : null;

            const displayTicketType = ticketInfo ? ticketInfo.productName : "Unknown";
            const displayEventName = ticketInfo ? ticketInfo.eventName : "Unknown Event";

            return (
                <div key={index} className="mb-4 p-4 border rounded">
                    <p>Ticket Type: {displayTicketType}</p>
                    <p>Event Name: {displayEventName}</p>
                    {isAttestationLoading ? (
                        <p>Loading attestation...</p>
                    ) : attestationError ? (
                        <p>Error loading attestation: {attestationError.message}</p>
                    ) : (
                        <p>Attestation: {attestation ? 'Valid' : 'Invalid'}</p>
                    )}
                    <Button 
                        onClick={() => handleSignWithLoading(pcdData, index)} 
                        disabled={signingStates[index]}
                        className="mt-2"
                    >
                        {signingStates[index] ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Signing...
                            </>
                        ) : (
                            'Sign'
                        )}
                    </Button>
                </div>
            );
        } catch (error) {
            console.error("Error processing PCD:", error);
            return (
                <div key={index} className="mb-4 p-4 border rounded bg-red-100">
                    <p>Error: Unable to process ticket information</p>
                </div>
            );
        }
    };

    return (
        <>
            <Button 
                onClick={onZuAuth} 
                disabled={isLoading} 
                className="bg-[#f0b90b] hover:bg-[#d9a60b] text-[#19473f] font-semibold font-[Tahoma] flex items-center justify-center px-3 py-2 text-sm sm:text-base"
            >
                <Image
                    src="/zupass.webp"
                    alt="Zupass"
                    width={20}
                    height={20}
                    className="w-5 h-5 sm:w-6 sm:h-6 mr-2 rounded-full object-cover"
                />
                <span>
                    {isLoading ? 'Auth...' : 'Link Zupass'}
                </span>
            </Button>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Your Zupass Tickets</DialogTitle>
                    </DialogHeader>
                    {result && result.pcds ? (
                        <div>
                            {result.pcds.map((pcd: any, index: number) => renderPcdInfo(pcd, index))}
                        </div>
                    ) : (
                        <p>No tickets found or there was an error processing the result.</p>
                    )}
                    <DialogFooter>
                        <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
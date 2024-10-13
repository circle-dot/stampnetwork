"use client";

import { useState, useEffect } from 'react';
import { useZuAuth } from './zuauthLogic';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { showSuccessAlertWithoutRedirect, showErrorAlertWithSpace } from '@/utils/alertUtils';
import { matchTicketToType } from './zupass-config';
import { saveZupassTicket } from './zupassUtils';
import useAttestationCheck from '@/utils/hooks/useAttestationCheck';

export default function ZupassButton({ user, text, wallets }: { user: any, text: string, wallets: any }) {
    const { handleZuAuth, isLoading, result, handleSign, apiResponse } = useZuAuth();
    const [isLoadingBackend, setIsLoadingBackend] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const {  isLoading: isLoadingAttestations } = useAttestationCheck(user.wallet.address);

    useEffect(() => {
        if (result && result.pcds) {
            sendPcdsToBackend(result.pcds);
        }
    }, [result]);

    useEffect(() => {
        if (apiResponse) {
            handleApiResponse(apiResponse);
        }
    }, [apiResponse]);

    const onZuAuth = async () => {
        await handleZuAuth();
    };

    const sendPcdsToBackend = async (pcds: any) => {
        setIsLoadingBackend(true);
        try {
            await handleSign(pcds, wallets, user);
        } catch (error) {
            console.error("Error sending PCDs to backend:", error);
        } finally {
            setIsLoadingBackend(false);
        }
    };

    const handleApiResponse = async (response: any) => {
        if (response.message && Array.isArray(response.message)) {
            const failedTickets = response.message.filter((ticket: { error: any; }) => ticket.error);
            const successfulTickets = response.message.filter((ticket: { error: any; }) => !ticket.error);

            if (successfulTickets.length > 0) {
                const successMessage = await Promise.all(successfulTickets.map(async (ticket: { eventId: string; productId: string; productName: any; attestationUID: string; nullifier: string; issuer: string; category: string; subcategory: string; platform: string; }) => {
                    const ticketType = matchTicketToType(ticket.eventId, ticket.productId) || ticket.productName || 'Unknown ticket';
                    
                    // Save the ticket to the database
                    try {
                        await saveZupassTicket({
                            userId: user.id,
                            nullifier: ticket.nullifier,
                            attestationUID: ticket.attestationUID,
                            ticketType: ticketType,
                            issuer: ticket.issuer,
                            category: ticket.category,
                            subcategory: ticket.subcategory,
                            platform: ticket.platform
                        });
                        return `${ticketType} verified and saved successfully`;
                    } catch (error) {
                        console.error("Error saving Zupass ticket:", error);
                        return `${ticketType} verified but failed to save`;
                    }
                }));
                showSuccessAlertWithoutRedirect('PCD Verification Successful', successMessage.join('\n'));
            }

            if (failedTickets.length > 0) {
                console.log(failedTickets);
                const errorMessage = failedTickets.map((ticket: { eventId: string; productId: string; error: string; }) => {
                    const ticketType = matchTicketToType(ticket.eventId, ticket.productId) || 'Unknown ticket';
                    return `${ticketType}: ${ticket.error}`;
                }).join('\n');
                showErrorAlertWithSpace('PCD Verification Failed', errorMessage);
            }
        } else if (response.error) {
            showErrorAlertWithSpace('Error', response.error);
        }
    };

    return (
        <>
            <Button 
                onClick={() => setIsDialogOpen(true)} 
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold flex items-center justify-center px-3 py-2 text-sm sm:text-base rounded-xl"
            >
                <Image
                    src="/zupass.webp"
                    alt="Zupass"
                    width={20}
                    height={20}
                    className="w-5 h-5 sm:w-6 sm:h-6 mr-2 rounded-full object-cover"
                />
                <span>{text}</span>
            </Button>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px] bg-background text-foreground">
                    <DialogHeader>
                        <DialogTitle className="text-primary text-2xl">Connect with Zupass</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Connect your Zupass, if you want to add more tickets, also click on the button below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Button 
                            onClick={onZuAuth} 
                            disabled={isLoading || isLoadingBackend || isLoadingAttestations}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                        >
                            {isLoading || isLoadingBackend || isLoadingAttestations ? 'Connecting...' : 'Connect your Zupass'}
                        </Button>
                 
                    </div>
                    
                </DialogContent>
            </Dialog>
        </>
    );
}

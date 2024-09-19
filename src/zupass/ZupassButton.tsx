"use client";

import { useZuAuth } from './zuauthLogic';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useState } from 'react';
import Image from 'next/image';

export function ZuAuthButton({ user }: { user: any }) {
    const { handleZuAuth, isLoading, result, handleSign } = useZuAuth(user);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const onZuAuth = async () => {
        await handleZuAuth();
        setIsDialogOpen(true);
    };

    const renderPcdInfo = (pcdWrapper: any, index: number) => {
        console.log("PCD wrapper:", pcdWrapper);

        try {
            const pcdData = JSON.parse(pcdWrapper.pcd);
            console.log("Parsed PCD data:", pcdData);

            const ticketType = pcdData.claim?.partialTicket?.ticketCategory || "Not specified";
            const eventId = pcdData.claim?.partialTicket?.eventId || "Not specified";

            return (
                <div key={index} className="mb-4 p-4 border rounded">
                    <p>Ticket Type: {ticketType}</p>
                    <p>Event ID: {eventId}</p>
                    <Button onClick={() => handleSign(pcdData)} className="mt-2">Sign</Button>
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
                    {isLoading ? 'Auth...' : 'Zupass'}
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
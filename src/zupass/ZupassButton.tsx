"use client";

import { useZuAuth } from './zuauthLogic';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useState } from 'react';

export function ZuAuthButton({ community }: { community: any }) {
    const { handleZuAuth, isLoading, result, handleSign } = useZuAuth(community);
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
                className="bg-[#f0b90b] hover:bg-[#d9a60b] text-[#19473f] font-semibold font-[Tahoma]"
            >
                {isLoading ? 'Authenticating...' : 'Connect Zupass'}
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
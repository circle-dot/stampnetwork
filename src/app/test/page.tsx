"use client";

import { useState } from 'react';
import { zuAuthPopup, ZuAuthArgs } from "@pcd/zuauth";
import { whitelistedTickets } from "@/zupass/zupass-config";
import { TicketTypeName } from "@/zupass/types";

const watermark = "0";
    // Ensure the tickets are formatted correctly
    const config = Object.entries(whitelistedTickets).flatMap(
        ([ticketType, tickets]) =>
            tickets
                .map((ticket) => {
                    if (ticket.eventId && ticket.productId) {
                        return {
                            pcdType: ticket.pcdType,
                            ticketType: ticketType as TicketTypeName,
                            eventId: ticket.eventId,
                            productId: ticket.productId,
                            eventName: ticket.eventName || "",
                            productName: ticket.productName || "",
                            publicKey: ticket.publicKey
                        };
                    }
                    console.error("Invalid ticket format:", ticket);
                    return null;
                })
                .filter(
                    (ticket): ticket is NonNullable<typeof ticket> => ticket !== null
                )
    );
function Page() {
    const [result, setResult] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [apiResponse, setApiResponse] = useState<any>(null);

    const handleZuAuth = async () => {
        setIsLoading(true);

        try {
            const args: ZuAuthArgs = {
                fieldsToReveal: {
                    revealAttendeeEmail: true,
                    revealAttendeeName: true,
                    revealEventId: true,
                    revealProductId: true,
                    revealAttendeeSemaphoreId: true,
                    revealTicketCategory: true
                },
                returnUrl: window.location.origin,
                watermark,
                config,
                proofTitle: "Connect with Zupass",
                proofDescription: "**Connect your Zupass to Agora Pass**",
                multi: true
            };

            const result = await zuAuthPopup(args);
            console.log("🚀 ~ login ~ result:", result);
            setResult(result);
            // Send PCDs to API route
            if (result && result.type === "multi-pcd" && Array.isArray(result.pcds)) {
                const response = await fetch('/api/test', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ pcds: result.pcds }),
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setApiResponse(data);
            } else {
                throw new Error("No PCDs returned from zuAuthPopup");
            }
        } catch (error) {
            console.error("ZuAuth error:", error);
            setResult(null);
            setApiResponse({ error: error instanceof Error ? error.message : String(error) });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h1>ZuAuth Test Page</h1>
            <button onClick={handleZuAuth} disabled={isLoading}>
                {isLoading ? 'Authenticating...' : 'Start ZuAuth'}
            </button>
            {result && (
                <div>
                    <h2>ZuAuth Result:</h2>
                    <pre>{JSON.stringify(result, null, 2)}</pre>
                </div>
            )}
            {apiResponse && (
                <div>
                    <h2>API Response:</h2>
                    <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}

export default Page;
"use client";

import { useState } from 'react';
import { zuAuthPopup, ZuAuthArgs } from "@pcd/zuauth";

const watermark = "0";

const config = [
    {
      pcdType: "eddsa-ticket-pcd",
      publicKey: [
        "1ebfb986fbac5113f8e2c72286fe9362f8e7d211dbc68227a468d7b919e75003",
        "10ec38f11baacad5535525bbe8e343074a483c051aa1616266f3b1df3fb7d204"
      ],
      productId: "15ab7fc2-eaea-5c0c-87d5-6b233b030a9b",
      eventId: "3dcdb35d-507c-57e8-8629-5a09239f7033",
      eventName: "AgoraCity",
      productName: "Founder"
    },
    {
      pcdType: "eddsa-ticket-pcd",
      publicKey: [
        "1ebfb986fbac5113f8e2c72286fe9362f8e7d211dbc68227a468d7b919e75003",
        "10ec38f11baacad5535525bbe8e343074a483c051aa1616266f3b1df3fb7d204"
      ],
      productId: "28155a86-913f-57dd-a65c-d16ae3149385",
      eventId: "6900784f-b677-5885-b8fc-bc824cfd88d6",
      eventName: "AgoraCity",
      productName: "Contributor"
    }
  ];

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
                // @ts-expect-error Check this out later
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
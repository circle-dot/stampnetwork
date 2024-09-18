import { NextRequest, NextResponse } from "next/server";
import { ZKEdDSAEventTicketPCDPackage } from "@pcd/zk-eddsa-event-ticket-pcd";
import { whitelistedTickets, matchTicketToType } from "@/zupass/zupass-config";
import { TicketTypeName } from "@/zupass/types";
import { isEqualEdDSAPublicKey } from "@pcd/eddsa-pcd";

export const POST = async (req: NextRequest) => {
  try {
    const { pcds: inputPCD } = await req.json();
    let response: { error?: string; status: number; nullifier?: string } = { status: 200 };

    try {
      console.log("Attempting to deserialize PCD:", inputPCD);
    const pcd = inputPCD;
    console.log("PCD:", pcd);
      const eventId = inputPCD.claim.partialTicket.eventId;
      const productId = inputPCD.claim.partialTicket.productId;

      console.log(`Matching ticket type for eventId: ${eventId}, productId: ${productId}`);
      if (!eventId || !productId) {
        console.log('EventId or ProductId is undefined');
        throw new Error("EventId or ProductId is undefined");
      }
      const ticketType = matchTicketToType(eventId, productId);
      if (!ticketType) {
        console.log('Failed to match ticket type');
        throw new Error("Unable to determine ticket type.");
      }
      console.log(`Matched ticket type: ${ticketType}`);
      if (!pcd.claim.nullifierHash) {
        response = {
          error: "PCD ticket nullifier has not been defined",
          status: 401
        };
      } else {
        let isValid = false;

        console.log('Verifying Zupass signature...');
        console.log('PCD signer:', JSON.stringify(pcd.claim.signer));

        for (const type of Object.keys(whitelistedTickets) as TicketTypeName[]) {
          const tickets = whitelistedTickets[type];

          if (tickets) {
            for (const ticket of tickets) {
              const publicKey = ticket.publicKey;
              console.log('Checking against public key:', JSON.stringify(publicKey));

              if (isEqualEdDSAPublicKey(publicKey, pcd.claim.signer)) {
                isValid = true;
                console.log('Found matching public key');
                break;
              }
            }
          }

          if (isValid) break;
        }

        if (!isValid) {
          console.error(`[ERROR] PCD is not signed by Zupass`);
          response = { error: "PCD is not signed by Zupass", status: 401 };
        } else {
          response.nullifier = pcd.claim.nullifierHash;
        }
      }
    } catch (error) {
      console.error('Error processing PCD:', error);
      response = { error: "Error processing PCD", status: 500 };
    }

    console.log("Response:", response);
    return new Response(JSON.stringify(response), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error(`[ERROR] ${error.message}`);
    return NextResponse.json(`Unknown error: ${error.message}`, { status: 500 });
  }
};
import { NextRequest, NextResponse } from "next/server";
import { whitelistedTickets, matchTicketToType } from "@/zupass/zupass-config";
import { TicketTypeName } from "@/zupass/types";
import { isEqualEdDSAPublicKey } from "@pcd/eddsa-pcd";
import handleAttest from "@/zupass/attestation/handleAttest";
import { ethers } from "ethers";

export const POST = async (req: NextRequest) => {
  try {
    const { pcds: inputPCD, community, user } = await req.json();
    let response: { error?: string; status: number; nullifier?: string; attestationUID?: string } = { status: 200 };

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
          
          // Call handleAttest function
          try {
            const recipient = user.wallet.address 
            const nullifier = ethers.hexlify(
              ethers.keccak256(
                ethers.concat([
                  ethers.toUtf8Bytes(pcd.claim.partialTicket.attendeeSemaphoreId),
                  ethers.keccak256(ethers.toUtf8Bytes(productId)) // Hash the productId
                ])
              ).slice(0, 66)
            );
            const category = community.category;
            const subcategory = ticketType;
            const issuer =  community.name;
            const credentialType = ticketType;
            const platform = "Zupass";

            const attestationUID = await handleAttest(
              recipient,
              nullifier,
              category,
              subcategory,
              issuer,
              credentialType,
              platform
            );

            response.attestationUID = attestationUID;
            console.log("Attestation created successfully:", attestationUID);
          } catch (attestError) {
            console.error("Error creating attestation:", attestError);
            response = { error: "Error creating attestation", status: 500 };
          }
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
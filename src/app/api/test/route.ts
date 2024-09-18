import { NextRequest } from "next/server";
import { ZKEdDSAEventTicketPCDPackage } from "@pcd/zk-eddsa-event-ticket-pcd";
import { whitelistedTickets, supportedEvents, matchTicketToType } from "@/utils/zupass-config";
import { TicketTypeName } from "@/utils/types";
import { isEqualEdDSAPublicKey } from "@pcd/eddsa-pcd";
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Received body:", body);

    if (!body.pcds || !Array.isArray(body.pcds)) {
      throw new Error("Invalid request structure");
    }

    const responses: { error?: string; status: number; nullifier?: string }[] = [];
    const nullifiers = new Set<string>();
    const validPcds: any[] = [];

    for (const { type, pcd: inputPCD } of body.pcds) {
      if (type !== "zk-eddsa-event-ticket-pcd") {
        responses.push({ error: `Invalid PCD type: ${type}`, status: 400 });
        continue;
      }

      const pcd = await ZKEdDSAEventTicketPCDPackage.deserialize(inputPCD);

      if (!pcd) {
        responses.push({
          error: "Invalid PCD format or deserialization error",
          status: 400
        });
        continue;
      }

      if (!pcd.claim.nullifierHash) {
        responses.push({
          error: "PCD ticket nullifier has not been defined",
          status: 401
        });
        continue;
      }
      const eventId = pcd.claim.partialTicket.eventId;
      if (eventId && !supportedEvents.includes(eventId)) {
        responses.push({
          error: `PCD ticket is not for a supported event: ${eventId}`,
          status: 400
        });
        continue;
      }

      if (!(await ZKEdDSAEventTicketPCDPackage.verify(pcd))) {
        responses.push({ error: "ZK ticket PCD is not valid", status: 401 });
        continue;
      }

      try {
        const productId = pcd.claim.partialTicket.productId;

        if (!eventId || !productId) {
          throw new Error("No product or event selected.");
        }

        const ticketType = matchTicketToType(eventId, productId);
        if (!ticketType) {
          throw new Error("Unable to determine ticket type.");
        }

        nullifiers.add(pcd.claim.nullifierHash);
        validPcds.push({ pcd, ticketType });
      } catch (error) {
        console.error('Error processing PCD:', error);
        responses.push({ error: "Error processing PCD", status: 500 });
      }
    }

    if (validPcds.length > 0) {
      for (const { pcd, ticketType } of validPcds) {
        let isValid = false;

        const tickets = whitelistedTickets[ticketType as TicketTypeName];
        if (tickets) {
          for (const ticket of tickets) {
            const publicKey = ticket.publicKey;

            if (isEqualEdDSAPublicKey(publicKey, pcd.claim.signer)) {
              isValid = true;
              break;
            }
          }
        }

        if (!isValid) {
          console.error(`[ERROR] PCD is not signed by Zupass`);
          responses.push({ error: "PCD is not signed by Zupass", status: 401 });
        } else {
          responses.push({ status: 200, nullifier: pcd.claim.nullifierHash });
        }
      }
    }

    if (responses.every(r => r.status === 200)) {
      return Response.json({ nullifiers: Array.from(nullifiers) });
    } else {
      const firstError = responses.find(r => r.status !== 200);
      return new Response(JSON.stringify({ error: firstError?.error }), { status: firstError?.status || 400 });
    }

  } catch (e) {
    console.error("Authentication error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
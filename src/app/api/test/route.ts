import { NextRequest, NextResponse } from "next/server";
import { ZKEdDSAEventTicketPCDPackage } from "@pcd/zk-eddsa-event-ticket-pcd";
import { whitelistedTickets, supportedEvents, matchTicketToType } from "@/utils/zupass-config";
import { TicketTypeName } from "@/utils/types";
import { isEqualEdDSAPublicKey } from "@pcd/eddsa-pcd";

export const POST = async (req: NextRequest) => {
	const nullifiers = new Set<string>();

	try {
		const { pcds } = await req.json();
		const responses: { error?: string; status: number; nullifier?: string }[] = [];
		const validPcds: any[] = [];

		for (const { type, pcd: inputPCD } of pcds) {
			try {
				if (type !== "zk-eddsa-event-ticket-pcd") {
					responses.push({ error: `Invalid PCD type: ${type}`, status: 400 });
					continue;
				}

				console.log("Attempting to deserialize PCD:", inputPCD);
				const pcd = await ZKEdDSAEventTicketPCDPackage.deserialize(inputPCD);
				console.log('Deserialized PCD:', JSON.stringify(pcd, null, 2));

				const eventId = pcd.claim.partialTicket.eventId;
				const productId = pcd.claim.partialTicket.productId;

				console.log(`Matching ticket type for eventId: ${eventId}, productId: ${productId}`);
				const ticketType = matchTicketToType(eventId, productId);
				if (!ticketType) {
					console.log('Failed to match ticket type');
					throw new Error("Unable to determine ticket type.");
				}
				console.log(`Matched ticket type: ${ticketType}`);

				// ... rest of the processing logic ...

				nullifiers.add(pcd.claim.nullifierHash);
				validPcds.push(pcd);
			} catch (error) {
				console.error('Error processing PCD:', error);
				responses.push({ error: "Error processing PCD", status: 500 });
			}
		}

		if (validPcds.length > 0) {
			for (let pcd of validPcds) {
				let isValid = false;

				console.log('Verifying Zupass signature...');
				console.log('PCD signer:', JSON.stringify(pcd.claim.signer));

				for (let type of Object.keys(whitelistedTickets) as TicketTypeName[]) {
					const tickets = whitelistedTickets[type];

					if (tickets) {
						for (let ticket of tickets) {
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
					responses.push({ error: "PCD is not signed by Zupass", status: 401 });
				}
			}

			// ... rest of the code ...
		}

		console.log("Responses:", responses);
		console.log("Valid PCDs:", validPcds);
		return new Response(JSON.stringify({ responses, validPcds }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});

	} catch (error: any) {
		console.error(`[ERROR] ${error.message}`);
		return NextResponse.json(`Unknown error: ${error.message}`, { status: 500 });
	}
};
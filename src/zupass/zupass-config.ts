import type { PipelineEdDSATicketZuAuthConfig } from "@pcd/passport-interface";
import { ESMERALDA_TICKET } from "@pcd/zuauth";
import { ticketTypeNames } from "./constants";
import { TicketTypeName } from "./types";

/**
 * We want to match a ticket based on a pairing of event IDs and product IDs.
 * We also want to divide these into categories or "types" of ticket. There
 * are four types, as defined above, and each type has one or more pairs of
 * event and product IDs that qualify a ticket as belonging to that group.
 *
 * With this data, we can classify a user's ticket and use this to make some
 * decisions about what access to grant, or other features to enable or
 * disable.
 */
export const whitelistedTickets: Record<
  TicketTypeName,
  PipelineEdDSATicketZuAuthConfig[]
> = {
  Zuzalu: [
    {
      pcdType: "eddsa-ticket-pcd",
      publicKey: [
        "05e0c4e8517758da3a26c80310ff2fe65b9f85d89dfc9c80e6d0b6477f88173e",
        "29ae64b615383a0ebb1bc37b3a642d82d37545f0f5b1444330300e4c4eedba3f"
      ],
      eventId: "5de90d09-22db-40ca-b3ae-d934573def8b",
      eventName: "Zuzalu",
      productId: "5ba4cd9e-893c-4a4a-b15b-cf36ceda1938",
      productName: "Resident"
    },
    {
      pcdType: "eddsa-ticket-pcd",
      publicKey: [
        "05e0c4e8517758da3a26c80310ff2fe65b9f85d89dfc9c80e6d0b6477f88173e",
        "29ae64b615383a0ebb1bc37b3a642d82d37545f0f5b1444330300e4c4eedba3f"
      ],
      eventId: "5de90d09-22db-40ca-b3ae-d934573def8b",
      eventName: "Zuzalu",
      productId: "10016d35-40df-4033-a171-7d661ebaccaa",
      productName: "Organizer"
    },
    {
      pcdType: "eddsa-ticket-pcd",
      publicKey: [
        "05e0c4e8517758da3a26c80310ff2fe65b9f85d89dfc9c80e6d0b6477f88173e",
        "29ae64b615383a0ebb1bc37b3a642d82d37545f0f5b1444330300e4c4eedba3f"
      ],
      eventId: "5de90d09-22db-40ca-b3ae-d934573def8b",
      eventName: "Zuzalu",
      productId: "53b518ed-e427-4a23-bf36-a6e1e2764256",
      productName: "Visitor"
    }
  ],
  ZuConnect: [
    {
      pcdType: "eddsa-ticket-pcd",
      publicKey: [
        "05e0c4e8517758da3a26c80310ff2fe65b9f85d89dfc9c80e6d0b6477f88173e",
        "29ae64b615383a0ebb1bc37b3a642d82d37545f0f5b1444330300e4c4eedba3f"
      ],
      eventId: "91312aa1-5f74-4264-bdeb-f4a3ddb8670c",
      eventName: "ZuConnect",
      productId: "cc9e3650-c29b-4629-b275-6b34fc70b2f9",
      productName: "Resident"
    },
    {
      pcdType: "eddsa-ticket-pcd",
      publicKey: [
        "05e0c4e8517758da3a26c80310ff2fe65b9f85d89dfc9c80e6d0b6477f88173e",
        "29ae64b615383a0ebb1bc37b3a642d82d37545f0f5b1444330300e4c4eedba3f"
      ],
      eventId: "54863995-10c4-46e4-9342-75e48b68d307",
      eventName: "ZuConnect",
      productId: "d2123bf9-c027-4851-b52c-d8b73fc3f5af",
      productName: "First Week"
    },
    {
      pcdType: "eddsa-ticket-pcd",
      publicKey: [
        "05e0c4e8517758da3a26c80310ff2fe65b9f85d89dfc9c80e6d0b6477f88173e",
        "29ae64b615383a0ebb1bc37b3a642d82d37545f0f5b1444330300e4c4eedba3f"
      ],
      eventId: "797de414-2aec-4ef8-8655-09df7e2b6cc6",
      eventName: "ZuConnect",
      productId: "d3620f38-56a9-4235-bea8-0d1dba6bb623",
      productName: "Scholarship"
    },
    {
      pcdType: "eddsa-ticket-pcd",
      publicKey: [
        "05e0c4e8517758da3a26c80310ff2fe65b9f85d89dfc9c80e6d0b6477f88173e",
        "29ae64b615383a0ebb1bc37b3a642d82d37545f0f5b1444330300e4c4eedba3f"
      ],
      eventId: "f7370f63-b9ae-480c-9ded-0663f1922bef",
      eventName: "ZuConnect",
      productId: "0179ed5b-f265-417c-aeaa-ac61a525c6b0",
      productName: "Organizer"
    }
  ],
  Vitalia: [
    {
      pcdType: "eddsa-ticket-pcd",
      publicKey: [
        "0d3388a18b89dd012cb965267ab959a6ca68f7e79abfdd5de5e3e80f86821a0d",
        "0babbc67ab5da6c9245137ae75461f64a90789ae5abf3737510d5442bbfa3113"
      ],
      eventId: "9ccc53cb-3b0a-415b-ab0d-76cfa21c72ac",
      eventName: "Vitalia",
      productId: "cd3f2b06-e520-4eff-b9ed-c52365c60848",
      productName: "Resident"
    }
  ],
  ZuVillage: [
    {
      pcdType: "eddsa-ticket-pcd",
      productId: "aecf9f84-b92f-5b40-8541-cbb48f4d6267",
      publicKey: [
        "1ebfb986fbac5113f8e2c72286fe9362f8e7d211dbc68227a468d7b919e75003",
        "10ec38f11baacad5535525bbe8e343074a483c051aa1616266f3b1df3fb7d204"
      ],
      eventId: "6f5f194b-97b5-5fe9-994d-0998f3eacc75",
      eventName: "ZuVillage Georgia",
      productName: "Contributor"
    }
  ],
  Esmeralda: ESMERALDA_TICKET,
  AgoraCore: [
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
  ],
  //  America: [
  //   {
  //     pcdType: "eddsa-ticket-pcd",
  //     publicKey: [
  //       "05e0c4e8517758da3a26c80310ff2fe65b9f85d89dfc9c80e6d0b6477f88173e",
  //       "29ae64b615383a0ebb1bc37b3a642d82d37545f0f5b1444330300e4c4eedba3f"
  //     ],
  //     eventId: "be4dbf9c-abc9-4bc2-a731-3464b84ce3fb",
  //     eventName: "ETH Latam",
  //     productId: "8d081915-8d2e-4660-adb6-3841960f810f",
  //     productName: "Regular ticket"
  //   }
  // ],
  // TestTicket: [
  //   {
  //     pcdType: "eddsa-ticket-pcd",
  //     publicKey: [
  //       "1ebfb986fbac5113f8e2c72286fe9362f8e7d211dbc68227a468d7b919e75003",
  //       "10ec38f11baacad5535525bbe8e343074a483c051aa1616266f3b1df3fb7d204"
  //     ],
  //     productId: "b8bcccb9-3912-5329-aaa3-ea4cb7ab4a0d",
  //     eventId: "718555c0-3ce7-5844-8ad3-da9ba4ae897b",
  //     eventName: "Europe",
  //     productName: "GA"
  //   },
  //   {
  //     pcdType: "eddsa-ticket-pcd",
  //     publicKey: [
  //       "1ebfb986fbac5113f8e2c72286fe9362f8e7d211dbc68227a468d7b919e75003",
  //       "10ec38f11baacad5535525bbe8e343074a483c051aa1616266f3b1df3fb7d204"
  //     ],
  //     productId: "c7807d6c-3cea-5ce6-ba97-519d543265fe",
  //     eventId: "63933c56-d49e-509e-af29-575e19375a80",
  //     eventName: "Europe",
  //     productName: "VIP"
  //   },
  //   {
  //     pcdType: "eddsa-ticket-pcd",
  //     publicKey: [
  //       "1ebfb986fbac5113f8e2c72286fe9362f8e7d211dbc68227a468d7b919e75003",
  //       "10ec38f11baacad5535525bbe8e343074a483c051aa1616266f3b1df3fb7d204"
  //     ],
  //     productId: "f4c59e92-0368-5082-9fd2-6f3b245de231",
  //     eventId: "7fd0a623-ab22-51d7-8920-abf5de0acb22",
  //     eventName: "America",
  //     productName: "GA"
  //   }
  // ],
};

// Map the above data structure into a simple array of event IDs.
export const supportedEvents = Object.values(whitelistedTickets).flatMap(
  (items) => items.map((item) => item.eventId)
);

/**
 * Use the above data structure to map a ticket's event ID and product ID to
 * a known ticket type, if any exists. Returns undefined if no match is found.
 */
export function matchTicketToType(
  eventIdToMatch: string,
  productIdToMatch: string
): TicketTypeName | undefined {
  for (const name of ticketTypeNames) {
    for (const { eventId, productId } of whitelistedTickets[name]) {
      if (eventId === eventIdToMatch && productId === productIdToMatch) {
        return name;
      }
    }
  }

  return undefined;
}

import type { Order, JastipEvent } from "./types";

export const mockEvents: JastipEvent[] = [
  {
    id: "event-1",
    name: "Japan Comic Con 2024",
    description: "Exclusive merchandise from the biggest comic convention in Tokyo.",
    date: new Date("2024-11-15T09:00:00Z"),
    imageUrl: "https://picsum.photos/seed/jc2024/600/400",
    imageHint: "comic con",
  },
  {
    id: "event-2",
    name: "Bangkok Sneaker Fest",
    description: "Rare and limited edition sneakers from top brands and resellers.",
    date: new Date("2024-12-05T10:00:00Z"),
    imageUrl: "https://picsum.photos/seed/bkksneaker/600/400",
    imageHint: "sneakers",
  },
  {
    id: "event-3",
    name: "Seoul Beauty Expo",
    description: "Get the latest and greatest in K-Beauty, straight from the source.",
    date: new Date("2024-11-28T09:00:00Z"),
    imageUrl: "https://picsum.photos/seed/kbeauty/600/400",
    imageHint: "cosmetics",
  },
];


export const mockOrders: Order[] = [
  {
    id: "JTE-001",
    eventId: "event-1",
    itemDescription: "Limited Edition Figurine, Model Y",
    quantity: 1,
    specificRequests: "Please check for any defects and ensure the box is in mint condition.",
    status: "Processing",
    createdAt: new Date("2023-10-26T10:00:00Z"),
    price: 180,
  },
  {
    id: "JTE-002",
    eventId: "event-1",
    itemDescription: "Exclusive Art Book",
    quantity: 1,
    status: "Shipped",
    createdAt: new Date("2023-10-25T14:30:00Z"),
    price: 60,
  },
  {
    id: "JTE-003",
    eventId: "event-2",
    itemDescription: "Hand-painted Custom Nikes, Size 9",
    quantity: 1,
    specificRequests: "Pastel color theme if possible.",
    status: "Completed",
    createdAt: new Date("2023-10-22T09:15:00Z"),
    price: 250,
  },
  {
    id: "JTE-004",
    eventId: "event-3",
    itemDescription: "Full Set of 'Glow Up' Serum",
    quantity: 2,
    status: "Placed",
    createdAt: new Date(),
    price: 90,
  },
  {
    id: "JTE-005",
    eventId: "event-2",
    itemDescription: "Vintage Air Jordans",
    quantity: 1,
    status: "Cancelled",
    createdAt: new Date("2023-10-20T11:00:00Z"),
    price: 340,
  },
];

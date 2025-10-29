import type { Timestamp } from "firebase/firestore";

export type OrderStatus =
  | "Placed"
  | "Processing"
  | "Shipped"
  | "Completed"
  | "Cancelled";

export type Order = {
  id: string;
  userId: string;
  eventId: string;
  itemDescription: string;
  quantity: number;
  specificRequests?: string;
  status: OrderStatus;
  createdAt: Timestamp;
  price: number; // price per item
};

export type JastipEvent = {
  id: string;
  name: string;
  description: string;
  date: Timestamp;
  imageUrl: string;
  catalogUrl?: string;
  ownerId?: string;
};

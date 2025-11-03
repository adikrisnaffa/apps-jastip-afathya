import type { Timestamp } from "firebase/firestore";

export type OrderStatus = "Paid" | "Not Paid";

export type Order = {
  id: string;
  userId: string;
  eventId: string;
  customerName: string;
  itemDescription: string;
  quantity: number;
  specificRequests?: string;
  status: OrderStatus;
  createdAt: Timestamp;
  price: number; // price per item
  originalPrice?: number; // original purchase price, for internal tracking
  jastipFee: number;
};

export type JastipEvent = {
  id: string;
  name: string;
  description: string;
  date: Timestamp;
};

export type User = {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
}

export type ActivityLog = {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    action: "CREATE" | "UPDATE" | "DELETE";
    entityType: "Order" | "JastipEvent" | "User";
    entityId: string;
    timestamp: Timestamp;
    details: string;
}

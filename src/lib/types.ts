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
};

export type JastipEvent = {
  id: string;
  name: string;
  description: string;
  date: Timestamp;
};

export type UserRole = "admin" | "user";

export type User = {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    role?: UserRole;
}

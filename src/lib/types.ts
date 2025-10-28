export type OrderStatus =
  | "Placed"
  | "Processing"
  | "Shipped"
  | "Completed"
  | "Cancelled";

export type Order = {
  id: string;
  itemDescription: string;
  quantity: number;
  specificRequests?: string;
  status: OrderStatus;
  createdAt: Date;
  price: number; // price per item
  eventId: string;
};

export type JastipEvent = {
  id: string;
  name: string;
  description: string;
  date: Date;
  imageUrl: string;
  imageHint: string;
};

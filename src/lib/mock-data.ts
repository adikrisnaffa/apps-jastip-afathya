import type { Order } from "./types";

export const mockOrders: Order[] = [
  {
    id: "JTE-001",
    itemDescription: "Limited Edition Sneakers, Model X, Size 10",
    quantity: 1,
    specificRequests: "Please check for any defects and ensure the box is in mint condition.",
    status: "Processing",
    createdAt: new Date("2023-10-26T10:00:00Z"),
    price: 180,
  },
  {
    id: "JTE-002",
    itemDescription: "Artisan Coffee Beans from Local Roaster, 250g",
    quantity: 3,
    status: "Shipped",
    createdAt: new Date("2023-10-25T14:30:00Z"),
    price: 15,
  },
  {
    id: "JTE-003",
    itemDescription: "Handmade Leather Wallet",
    quantity: 1,
    specificRequests: "Dark brown color if available.",
    status: "Completed",
    createdAt: new Date("2023-10-22T09:15:00Z"),
    price: 75,
  },
  {
    id: "JTE-004",
    itemDescription: "Vintage Sci-Fi Novel Collection",
    quantity: 1,
    status: "Placed",
    createdAt: new Date(),
    price: 120,
  },
  {
    id: "JTE-005",
    itemDescription: "Exclusive Concert Merchandise T-Shirt, Size L",
    quantity: 2,
    status: "Cancelled",
    createdAt: new Date("2023-10-20T11:00:00Z"),
    price: 40,
  },
];

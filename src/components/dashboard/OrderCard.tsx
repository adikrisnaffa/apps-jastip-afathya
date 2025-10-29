"use client";

import type { Order, OrderStatus } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NotaDialog } from "./NotaDialog";
import { deleteDoc, doc } from "firebase/firestore";
import { useFirestore, useUser } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";

type OrderCardProps = {
  order: Order;
};

const statusConfig: Record<
  OrderStatus,
  { color: string; progress: number; label: string }
> = {
  Placed: { color: "bg-gray-500", progress: 10, label: "Order Placed" },
  Processing: { color: "bg-orange-500", progress: 40, label: "Processing" },
  Shipped: { color: "bg-blue-500", progress: 75, label: "Shipped" },
  Completed: { color: "bg-green-600", progress: 100, label: "Completed" },
  Cancelled: { color: "bg-red-600", progress: 0, label: "Cancelled" },
};

export default function OrderCard({ order }: OrderCardProps) {
  const config = statusConfig[order.status];
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!user || !firestore) {
        toast({ title: "Error", description: "You must be logged in to delete an order.", variant: "destructive"});
        return;
    };
    setIsDeleting(true);
    const orderRef = doc(firestore, `users/${user.uid}/orders`, order.id);
    try {
        await deleteDocumentNonBlocking(orderRef);
        toast({ title: "Order Deleted", description: "The order has been successfully removed." });
        // Refresh handled by real-time listener
    } catch (error: any) {
        setIsDeleting(false);
        toast({ title: "Error Deleting Order", description: error.message, variant: "destructive"});
    }
  }

  return (
    <Card className="flex flex-col transform hover:-translate-y-1 transition-transform duration-300 ease-in-out shadow-lg hover:shadow-2xl">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="font-headline text-lg">{order.itemDescription}</CardTitle>
                <CardDescription>Order ID: {order.id}</CardDescription>
            </div>
          <Badge
            className={cn(
              "text-white whitespace-nowrap",
              config.color
            )}
          >
            {order.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2">
            <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>{config.label}</span>
                <span>{config.progress}%</span>
            </div>
          <Progress value={config.progress} aria-label={`Order status: ${order.status}`} />
          <p className="text-sm text-muted-foreground pt-2">
            Quantity: <span className="font-semibold text-foreground">{order.quantity}</span>
          </p>
        </div>
      </CardContent>
      <CardFooter className="grid grid-cols-3 gap-2">
        <NotaDialog order={order}>
          <Button variant="outline" className="w-full">
            Receipt
          </Button>
        </NotaDialog>
        <Button asChild variant="secondary" size="sm">
            <Link href={`/order/${order.id}/edit?eventId=${order.eventId}`}>
                <Edit className="mr-2 h-4 w-4" /> Edit
            </Link>
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" disabled={isDeleting}>
              <Trash2 className="mr-2 h-4 w-4" /> {isDeleting ? "..." : "Delete"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this order?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the order for &quot;{order.itemDescription}&quot;. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Confirm</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}

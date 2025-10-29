"use client";

import type { Order, OrderStatus } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { doc } from "firebase/firestore";
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
import { Edit, Trash2, CreditCard } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { deleteDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";

type OrderCardProps = {
  order: Order;
  isOwner: boolean;
};

const statusConfig: Record<
  OrderStatus,
  { color: string; progress: number; label: string }
> = {
  "Not Paid": { color: "bg-orange-500", progress: 50, label: "Awaiting Payment" },
  "Paid": { color: "bg-green-600", progress: 100, label: "Payment Confirmed" },
};

export default function OrderCard({ order, isOwner }: OrderCardProps) {
  const config = statusConfig[order.status];
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const handleDelete = async () => {
    if (!user || !firestore) {
        toast({ title: "Error", description: "You must be logged in to delete an order.", variant: "destructive"});
        return;
    };
    // Authorization: Only owner or the user who created the order can delete
    if (!isOwner && user.uid !== order.userId) {
        toast({ title: "Unauthorized", description: "You don't have permission to delete this order.", variant: "destructive"});
        return;
    }
    setIsDeleting(true);
    // Note: The path depends on who owns the order data.
    // If orders are always under the event owner, this is correct.
    // If users store their own orders, this path needs to change.
    // Assuming event owner stores all orders:
    const orderOwnerId = isOwner ? user.uid : order.userId;
    const orderRef = doc(firestore, `users/${orderOwnerId}/orders`, order.id);
    try {
        await deleteDocumentNonBlocking(orderRef);
        toast({ title: "Order Deleted", description: "The order has been successfully removed." });
    } catch (error: any) {
        setIsDeleting(false);
        toast({ title: "Error Deleting Order", description: error.message, variant: "destructive"});
    }
  }

  const handleMarkAsPaid = async () => {
    if (!user || !firestore || !isOwner) { // Only owner can mark as paid
        toast({ title: "Error", description: "Only the event owner can update payment status.", variant: "destructive"});
        return;
    };
    setIsUpdatingStatus(true);
    const orderRef = doc(firestore, `users/${user.uid}/orders`, order.id);
    try {
        await updateDocumentNonBlocking(orderRef, { status: "Paid" });
        toast({ title: "Order Updated", description: "The order has been marked as Paid." });
    } catch (error: any) {
        toast({ title: "Error Updating Status", description: error.message, variant: "destructive"});
    } finally {
        setIsUpdatingStatus(false);
    }
  }

  const canEdit = isOwner || (user && user.uid === order.userId);
  const canDelete = isOwner || (user && user.uid === order.userId);

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
           <p className="text-sm text-muted-foreground">
            Price: <span className="font-semibold text-foreground">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(order.price || 0)}
            </span>
          </p>
        </div>
      </CardContent>
      <CardFooter className="grid grid-cols-3 gap-2">
        {canEdit ? (
            <Button asChild variant="secondary" size="sm">
                <Link href={`/order/${order.id}/edit?eventId=${order.eventId}`}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                </Link>
            </Button>
        ) : <div/>}

        {isOwner && (
            <Button variant="outline" size="sm" onClick={handleMarkAsPaid} disabled={isUpdatingStatus || order.status === 'Paid'}>
                <CreditCard className="mr-2 h-4 w-4" />
                {isUpdatingStatus ? "..." : "Paid"}
            </Button>
        )}
        
        {canDelete && (
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
        )}
      </CardFooter>
    </Card>
  );
}


"use client";

import { useState } from "react";
import { useDoc } from "@/firebase/firestore/use-doc";
import { doc, deleteDoc, collection, query, where } from "firebase/firestore";
import { useFirestore, useMemoFirebase, useUser, useCollection } from "@/firebase";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import OrderList from "@/components/dashboard/OrderList";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowLeft, Edit, Trash2, Download, Upload } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { JastipEvent, Order } from "@/lib/types";
import * as XLSX from "xlsx";
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
import { useToast } from "@/hooks/use-toast";
import { logActivity } from "@/lib/activity-logger";
import { ImportDialog } from "@/components/dashboard/ImportDialog";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const eventRef = useMemoFirebase(() => {
    if (!firestore || !eventId) return null;
    return doc(firestore, "events", eventId);
  }, [firestore, eventId]);

  const ordersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "orders"), where("eventId", "==", eventId));
  }, [firestore, eventId]);

  const { data: orders, isLoading: areOrdersLoading } = useCollection<Order>(ordersQuery);

  const { data: event, isLoading: isEventLoading } = useDoc<JastipEvent>(eventRef);
  const isLoading = isEventLoading || areOrdersLoading;
  
  const eventDate = event?.date?.toDate();

  const canManageEvent = !!user;

  const handleExport = () => {
    if (!orders || orders.length === 0) {
        toast({
            title: "No Orders to Export",
            description: "There are no orders in this event to export.",
            variant: "destructive"
        });
        return;
    }

    const dataToExport = orders.map(order => ({
        "Customer Name": order.customerName,
        "Item Description": order.itemDescription,
        "Quantity": order.quantity,
        "Original Price (per item)": order.originalPrice || 0,
        "Price (per item)": order.price,
        "Jastip Fee (per item)": order.jastipFee,
        "Total": (order.price + order.jastipFee) * order.quantity,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    
    // Auto-size columns
    if (dataToExport.length > 0) {
        const cols = Object.keys(dataToExport[0]).map(key => ({
            wch: Math.max(20, key.length, ...dataToExport.map(row => {
                const value = row[key as keyof typeof row];
                return value ? String(value).length : 0;
            }))
        }));
        worksheet["!cols"] = cols;
    }

    XLSX.writeFile(workbook, `Jastip-${event?.name?.replace(/\s/g, '_') || 'Event'}-Orders.xlsx`);
  };

  const handleDelete = async () => {
    if (!canManageEvent || !eventRef || !firestore || !event) return;
    setIsDeleting(true);
    try {
        await deleteDoc(eventRef);
        logActivity(
          firestore,
          user,
          "DELETE",
          "JastipEvent",
          event.id,
          `Deleted event: ${event.name}`
        );
        toast({
            title: "Event Deleted",
            description: "The event has been successfully removed.",
        });
        router.push("/");
        router.refresh();
    } catch (error: any) {
        setIsDeleting(false);
        toast({
            title: "Error Deleting Event",
            description: error.message || "Could not delete the event. Please try again.",
            variant: "destructive",
        });
    }
  }

  if (isLoading) {
    return (
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <Skeleton className="h-8 w-32 mb-4" />
            <Skeleton className="h-10 w-3/4 mb-2" />
            <Skeleton className="h-6 w-1/2 mb-1" />
            <Skeleton className="h-5 w-1/4" />
        </div>
    )
  }

  if (!event) {
    return (
      <div className="container mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-destructive">Event not found</h1>
        <p className="text-muted-foreground">This event does not exist or has been removed.</p>
        <Link href="/" className="mt-4 inline-flex items-center text-primary hover:underline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to all events
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex justify-between items-start flex-wrap gap-4">
            <Button asChild variant="outline" className="mb-4">
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    All Events
                </Link>
            </Button>
            {canManageEvent && (
                <div className="flex gap-2">
                    <Button asChild variant="secondary">
                        <Link href={`/events/${eventId}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </Link>
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" disabled={isDeleting}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                {isDeleting ? "Deleting..." : "Delete"}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the event.
                                    (Note: Associated orders will not be deleted automatically).
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete}>
                                    Continue
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            )}
        </div>
        <h1 className="text-4xl font-bold font-headline text-foreground">{event.name}</h1>
        <p className="text-muted-foreground mt-2">{event.description}</p>
        <p className="text-sm text-primary font-semibold mt-1">{eventDate ? eventDate.toLocaleDateString() : 'Date not set'}</p>
      </div>
      
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h2 className="text-3xl font-bold font-headline text-foreground">
          Event Orders
        </h2>
        {user && (
          <div className="flex items-center gap-2">
            <ImportDialog eventId={eventId} onImporting={setIsImporting}>
                <Button variant="outline" disabled={isImporting}>
                    <Upload className="mr-2 h-4 w-4" />
                    {isImporting ? 'Importing...' : 'Import Orders'}
                </Button>
            </ImportDialog>
             <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export Orders
            </Button>
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href={`/order/new?eventId=${event.id}`}>
                <PlusCircle className="mr-2 h-5 w-5" />
                New Order
              </Link>
            </Button>
          </div>
        )}
      </div>
      <OrderList eventId={event.id} orders={orders || []} isLoading={areOrdersLoading}/>
    </div>
  );
}

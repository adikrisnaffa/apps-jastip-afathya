
"use client";

import { useMemo, useState } from "react";
import { useDoc } from "@/firebase/firestore/use-doc";
import { doc, deleteDoc } from "firebase/firestore";
import { useFirestore, useMemoFirebase, useUser } from "@/firebase/provider";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import OrderList from "@/components/dashboard/OrderList";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowLeft, Edit, Trash2, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { JastipEvent } from "@/lib/types";
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

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const eventRef = useMemoFirebase(() => {
    if (!firestore || !eventId) return null;
    return doc(firestore, "events", eventId);
  }, [firestore, eventId]);

  const { data: event, isLoading } = useDoc<JastipEvent>(eventRef);
  const eventDate = event?.date?.toDate();

  // Determine if the logged-in user is the owner of the event.
  // TEMPORARY FIX: Allow deletion if ownerId is missing and a user is logged in.
  const isOwner = useMemo(() => {
    if (!user || !event) return false;
    // New logic: User is owner if their UID matches event.ownerId OR if the event has no ownerId.
    return user.uid === event.ownerId || !event.ownerId;
  }, [user, event]);

  const handleDelete = async () => {
    if (!isOwner || !eventRef || !firestore) return;
    setIsDeleting(true);
    try {
        // This is a simplified approach. In a real-world app, you might want to
        // also delete all associated orders, perhaps using a Cloud Function for atomicity.
        await deleteDoc(eventRef);
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
            {isOwner && (
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
        {event.catalogUrl && (
            <Button asChild variant="outline" size="sm" className="mt-4">
                <a href={event.catalogUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" />
                    Download Catalog
                </a>
            </Button>
        )}
      </div>
      
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h2 className="text-3xl font-bold font-headline text-foreground">
          {isOwner ? "All Event Orders" : "My Orders"}
        </h2>
        {user && (
          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href={`/order/new?eventId=${event.id}`}>
              <PlusCircle className="mr-2 h-5 w-5" />
              New Order
            </Link>
          </Button>
        )}
      </div>
      <OrderList eventId={event.id} isOwner={isOwner} />
    </div>
  );
}

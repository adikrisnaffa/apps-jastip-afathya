"use client";

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc } from 'firebase/firestore';
import { useFirestore, useMemoFirebase, useUser } from '@/firebase/provider';
import { EventForm } from '@/components/events/EventForm';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const eventRef = useMemoFirebase(() => {
    if (!firestore || !eventId) return null;
    return doc(firestore, "events", eventId);
  }, [firestore, eventId]);

  const { data: event, isLoading: isEventLoading } = useDoc(eventRef);

  const isLoading = isUserLoading || isEventLoading;
  const isOwner = user && event && event.ownerId === user.uid;

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-2xl py-12 px-4">
        <Skeleton className="h-12 w-1/3 mb-4" />
        <Skeleton className="h-6 w-2/3 mb-8" />
        <div className="space-y-8">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto max-w-2xl py-12 px-4 text-center">
        <h1 className="text-2xl font-bold text-destructive">Event Not Found</h1>
        <p className="text-muted-foreground">The event you are trying to edit does not exist.</p>
        <Button asChild variant="link" className="mt-4">
            <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4"/>
                Back to Events
            </Link>
        </Button>
      </div>
    );
  }

  if (!isOwner) {
    return (
        <div className="container mx-auto max-w-2xl py-12 px-4">
            <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>
                    You do not have permission to edit this event.
                </AlertDescription>
            </Alert>
             <Button asChild variant="link" className="mt-4">
                <Link href={`/events/${eventId}`}>
                    <ArrowLeft className="mr-2 h-4 w-4"/>
                    Back to Event
                </Link>
            </Button>
        </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <EventForm event={event} />
    </div>
  );
}

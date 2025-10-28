"use client";

import { useCollection } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { useFirestore, useMemoFirebase } from "@/firebase/provider";
import EventCard from "@/components/events/EventCard";
import type { JastipEvent } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const firestore = useFirestore();

  const eventsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "events"), orderBy("date", "desc"));
  }, [firestore]);

  const { data: events, isLoading } = useCollection<JastipEvent>(eventsQuery);

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-headline text-primary">
          Upcoming Jastip Events
        </h1>
        <p className="text-muted-foreground mt-2">
          Choose an event to start your shopping journey.
        </p>
      </div>

      {isLoading && (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      )}

      {!isLoading && events && (
         <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      {!isLoading && !events?.length && (
        <div className="text-center text-muted-foreground">
          <p>No events found. Create a new one to get started!</p>
        </div>
      )}
    </div>
  );
}

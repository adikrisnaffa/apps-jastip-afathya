import { mockEvents } from "@/lib/mock-data";
import EventCard from "@/components/events/EventCard";

export default function Home() {
  const events = mockEvents;

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

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}

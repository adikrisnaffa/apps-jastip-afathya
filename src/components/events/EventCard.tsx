"use client";

import type { JastipEvent } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";

type EventCardProps = {
  event: JastipEvent;
};

export default function EventCard({ event }: EventCardProps) {
  const eventDate = event.date?.toDate();

  return (
    <Card className="flex flex-col transform hover:-translate-y-1 transition-transform duration-300 ease-in-out shadow-lg hover:shadow-2xl overflow-hidden">
      <div className="p-6 flex flex-col flex-grow">
        <CardTitle className="font-headline text-xl mb-2">{event.name}</CardTitle>
        <div className="flex items-center text-sm text-muted-foreground mb-4">
            <Calendar className="mr-2 h-4 w-4" />
            <span>{eventDate ? eventDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Date not set'}</span>
        </div>
        <CardDescription className="flex-grow">{event.description}</CardDescription>
      </div>
      <CardFooter className="p-6 pt-0">
        <Button asChild className="w-full">
          <Link href={`/events/${event.id}`}>
            View Event
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

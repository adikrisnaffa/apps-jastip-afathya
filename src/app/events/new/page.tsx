"use client";

import { EventForm } from "@/components/events/EventForm";
import Header from "@/components/layout/Header";

export default function NewEventPage() {
  return (
    <>
    <Header />
    <main className="flex-grow">
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <EventForm />
    </div>
    </main>
    </>
  );
}

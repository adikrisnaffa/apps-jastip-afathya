"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { collection, doc, Timestamp } from "firebase/firestore";
import { useFirestore, useUser } from "@/firebase";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
} from "@/firebase/non-blocking-updates";
import type { JastipEvent } from "@/lib/types";


const eventFormSchema = z.object({
  name: z
    .string({ required_error: "Please enter an event name." })
    .min(5, { message: "Event name must be at least 5 characters." }),
  description: z
    .string({ required_error: "Please enter a description." })
    .min(10, { message: "Description must be at least 10 characters." }),
  date: z
    .string({ required_error: "Please select a date." })
    .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format." }),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

type EventFormProps = {
  event?: JastipEvent;
};

export function EventForm({ event }: EventFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const isEditMode = !!event;

  const defaultValues = isEditMode
    ? {
        name: event.name,
        description: event.description,
        date: event.date.toDate().toISOString().split("T")[0],
      }
    : {
        name: "",
        description: "",
        date: "",
      };

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const {
    formState: { isSubmitting },
  } = form;

  async function onSubmit(data: EventFormValues) {
    if (!firestore) {
      toast({
        title: "Error",
        description: "Firestore is not available.",
        variant: "destructive",
      });
      return;
    }
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to manage an event.",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    try {
      // Prepare data for Firestore
      const eventData = {
        name: data.name,
        description: data.description,
        date: Timestamp.fromDate(new Date(data.date)),
      };

      if (isEditMode && event.id) {
        const eventRef = doc(firestore, "events", event.id);
        updateDocumentNonBlocking(eventRef, eventData);
        toast({
          title: "Event Updated!",
          description: "Your Jastip event has been successfully updated.",
        });
        router.push(`/events/${event.id}`);
      } else {
        const eventsCollection = collection(firestore, "events");
        addDocumentNonBlocking(eventsCollection, eventData);
        toast({
          title: "Event Created!",
          description: "Your new Jastip event has been successfully created.",
        });
        router.push("/");
      }

      router.refresh();
    } catch (error: any) {
      console.error("Error submitting event: ", error);
      toast({
        title: "Something went wrong",
        description:
          error.message || "Could not save the event. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <Card className="shadow-xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              {isEditMode ? "Edit Event" : "Create New Event"}
            </CardTitle>
            <CardDescription>
              {isEditMode
                ? "Update the details of your event."
                : "Fill in the details to create a new jastip event."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Event Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., 'Japan Summer Festival'"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the event and what kind of items can be bought."
                      className="resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This will be shown to users on the event card.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          {/* Footer */}
          <CardFooter className="flex justify-between flex-row-reverse">
            <Button type="submit" disabled={isSubmitting} className="w-1/2">
              {isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : isEditMode ? (
                "Save Changes"
              ) : (
                "Create Event"
              )}
            </Button>
            <Button asChild variant="outline" className="w-1/2">
              <Link href={isEditMode ? `/events/${event.id}` : "/"}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

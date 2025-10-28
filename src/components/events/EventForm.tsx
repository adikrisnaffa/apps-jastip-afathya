"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { addDoc, collection, Timestamp } from "firebase/firestore";
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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";

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
  imageHint: z
    .string({ required_error: "Please enter an image hint."})
    .min(2, { message: "Image hint must be at least 2 characters."})
});

type EventFormValues = z.infer<typeof eventFormSchema>;

export function EventForm() {
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    mode: "onChange",
  });

  async function onSubmit(data: EventFormValues) {
    if (!firestore) {
        toast({ title: "Error", description: "Firestore is not available.", variant: "destructive" });
        return;
    }
    if (!user) {
        toast({ title: "Authentication Error", description: "You must be logged in to create an event.", variant: "destructive" });
        router.push('/login');
        return;
    }

    try {
      const eventData = {
        ...data,
        date: Timestamp.fromDate(new Date(data.date)),
        imageUrl: `https://picsum.photos/seed/${data.name.replace(/\s/g, '')}/600/400`,
      };
      
      const eventsCollection = collection(firestore, "events");
      await addDocumentNonBlocking(eventsCollection, eventData);

      toast({
        title: "Event Created!",
        description: "Your new Jastip event has been successfully created.",
      });
      router.push("/");
      router.refresh(); // To show the new event on the homepage
    } catch (error: any) {
        console.error("Error creating event: ", error);
        toast({
            title: "Something went wrong",
            description: error.message || "Could not create the event. Please try again.",
            variant: "destructive",
        })
    }
  }

  return (
    <Card className="shadow-xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
             <CardTitle className="font-headline">Create New Event</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 'Japan Summer Festival'" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
             <FormField
              control={form.control}
              name="imageHint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image Hint</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 'summer festival'" {...field} />
                  </FormControl>
                  <FormDescription>
                    A 1-2 word hint for the AI to find a good background image.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex-row-reverse justify-between">
            <Button type="submit" className="w-1/2 bg-primary hover:bg-primary/90 text-primary-foreground">Create Event</Button>
            <Button asChild variant="outline" className="w-1/2">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Events
              </Link>
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

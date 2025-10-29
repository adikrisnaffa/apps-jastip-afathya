"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { collection, Timestamp } from "firebase/firestore";
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
} from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";

const orderFormSchema = z.object({
  itemDescription: z
    .string({
      required_error: "Please enter an item description.",
    })
    .min(10, {
      message: "Description must be at least 10 characters.",
    }),
  quantity: z.coerce
    .number({
      required_error: "Please enter a quantity.",
      invalid_type_error: "Quantity must be a number.",
    })
    .int()
    .min(1, { message: "You must order at least 1 item." }),
  specificRequests: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

const defaultValues: Partial<OrderFormValues> = {
  quantity: 1,
};

export function OrderForm({ eventId }: { eventId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const { formState: { isSubmitting } } = form;

  async function onSubmit(data: OrderFormValues) {
    if (!firestore) {
      toast({ title: "Error", description: "Firestore is not available.", variant: "destructive" });
      return;
    }
    if (!user) {
      toast({ title: "Not logged in", description: "You must be logged in to place an order.", variant: "destructive" });
      router.push('/login');
      return;
    }

    try {
      const ordersCollection = collection(firestore, "users", user.uid, "orders");
      const newOrder = {
        ...data,
        eventId: eventId,
        userId: user.uid,
        createdAt: Timestamp.now(),
        status: "Placed" as const,
        price: 0, // Assuming price will be set later by an admin
      };
      await addDocumentNonBlocking(ordersCollection, newOrder);

      toast({
        title: "Order Submitted!",
        description: "We've received your order and will begin processing it shortly.",
      });
      router.push(`/events/${eventId}`);
      router.refresh();

    } catch (error: any) {
       console.error("Error submitting order: ", error);
       toast({
         title: "Something went wrong",
         description: error.message || "Could not submit your order. Please try again.",
         variant: "destructive",
       });
    }
  }

  return (
    <Card className="shadow-xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="font-headline">Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <FormField
              control={form.control}
              name="itemDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., 'Limited edition sneakers, black, size 10'"
                      className="resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Be as specific as possible for the best results.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="specificRequests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specific Requests (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., 'Gift wrap, check for box condition'"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Any special instructions for your personal shopper.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex-row-reverse justify-between">
            <Button type="submit" disabled={isSubmitting} className="w-1/2 bg-primary hover:bg-primary/90 text-primary-foreground">
                {isSubmitting ? <Loader2 className="animate-spin" /> : "Submit Order"}
            </Button>
            <Button asChild variant="outline" className="w-1/2">
              <Link href={`/events/${eventId}`}>
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

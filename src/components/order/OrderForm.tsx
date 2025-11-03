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
} from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import { addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import type { Order } from "@/lib/types";
import { logActivity } from "@/lib/activity-logger";

const orderFormSchema = z.object({
  customerName: z
    .string({ required_error: "Please enter the customer's name."})
    .min(2, { message: "Name must be at least 2 characters." }),
  itemDescription: z
    .string({
      required_error: "Please enter an item description.",
    })
    .min(1, {
      message: "Please enter an item description.",
    }),
  quantity: z.coerce
    .number({
      required_error: "Please enter a quantity.",
      invalid_type_error: "Quantity must be a number.",
    })
    .int()
    .min(1, { message: "You must order at least 1 item." }),
  price: z.coerce
    .number({
        required_error: "Please enter a price.",
        invalid_type_error: "Price must be a number.",
    })
    .min(0, { message: "Price cannot be negative." }),
  originalPrice: z.coerce
    .number({
        invalid_type_error: "Original price must be a number.",
    })
    .min(0, { message: "Original price cannot be negative." })
    .optional(),
  jastipFee: z.coerce
    .number({
        required_error: "Please enter a Jastip fee.",
        invalid_type_error: "Fee must be a number.",
    })
    .min(0, { message: "Fee cannot be negative." }),
  specificRequests: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

type OrderFormProps = {
  eventId: string;
  order?: Order;
  defaultCustomerName?: string;
};

export function OrderForm({ eventId, order, defaultCustomerName }: OrderFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const isEditMode = !!order;

  const defaultValues = isEditMode
    ? {
        customerName: order.customerName,
        itemDescription: order.itemDescription,
        quantity: order.quantity,
        price: order.price,
        originalPrice: order.originalPrice || 0,
        jastipFee: order.jastipFee || 0,
        specificRequests: order.specificRequests || "",
      }
    : {
        customerName: defaultCustomerName || "",
        itemDescription: "",
        quantity: 1,
        price: 0,
        originalPrice: 0,
        jastipFee: 0,
        specificRequests: "",
      };

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
      toast({ title: "Not logged in", description: "You must be logged in to manage an order.", variant: "destructive" });
      router.push('/login');
      return;
    }

    try {
      if (isEditMode && order.id) {
        const orderRef = doc(firestore, "orders", order.id);
        updateDocumentNonBlocking(orderRef, data);
        logActivity(
          firestore,
          user,
          "UPDATE",
          "Order",
          order.id,
          `Updated order for "${data.customerName}": ${data.itemDescription}`
        );
        toast({
          title: "Order Updated!",
          description: "The order details have been successfully updated.",
        });
      } else {
        const ordersCollection = collection(firestore, "orders");
        const newOrder = {
          ...data,
          eventId: eventId,
          userId: user.uid,
          createdAt: Timestamp.now(),
          status: "Not Paid" as const,
        };
        const newDoc = await addDocumentNonBlocking(ordersCollection, newOrder);
        if (newDoc) {
            logActivity(
                firestore,
                user,
                "CREATE",
                "Order",
                newDoc.id,
                `New order for "${data.customerName}": ${data.itemDescription}`
            );
        }
        toast({
          title: "Order Submitted!",
          description: "We've received your order and will begin processing it shortly.",
        });
      }

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
            <CardTitle className="font-headline">{isEditMode ? "Edit Order" : "Order Details"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., 'Adikrisna'"
                      {...field}
                      disabled={isEditMode} // Don't allow changing customer name on edit
                    />
                  </FormControl>
                  <FormDescription>
                    The name of the person placing the order.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                name="originalPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Harga Asli (Rp)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="120000" {...field} />
                    </FormControl>
                     <FormDescription>
                      For internal tracking. Not shown on invoice.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price per Item (Rp)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="150000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="jastipFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fee Jastip (Rp)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="20000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
                {isSubmitting ? <Loader2 className="animate-spin" /> : isEditMode ? "Save Changes" : "Submit Order"}
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

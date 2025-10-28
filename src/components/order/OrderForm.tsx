"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
import { Sparkles, ArrowLeft } from "lucide-react";

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

export function OrderForm() {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues,
    mode: "onChange",
  });

  function onSubmit(data: OrderFormValues) {
    toast({
      title: "Order Submitted!",
      description: "We've received your order and will begin processing it shortly.",
    });
    router.push("/");
  }

  function onRefineDescription() {
    const currentDescription = form.getValues("itemDescription");
    if (!currentDescription) {
        toast({
            title: "Cannot Refine",
            description: "Please enter a description first.",
            variant: "destructive"
        })
        return;
    }
    const refined = `High-quality, original version of: "${currentDescription}". Please ensure authenticity and find the best possible price.`;
    form.setValue("itemDescription", refined, { shouldValidate: true });
    toast({
        title: "Description Refined!",
        description: "We've enhanced your description for clarity."
    });
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
                    <div className="relative">
                      <Textarea
                        placeholder="e.g., 'Limited edition sneakers, black, size 10'"
                        className="resize-y pr-10"
                        {...field}
                      />
                      <Button type="button" variant="ghost" size="icon" className="absolute top-1/2 right-1 -translate-y-1/2 h-8 w-8 text-primary" onClick={onRefineDescription} aria-label="Refine description with AI">
                          <Sparkles className="h-5 w-5"/>
                      </Button>
                    </div>
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
            <Button type="submit" className="w-1/2 bg-primary hover:bg-primary/90 text-primary-foreground">Submit Order</Button>
            <Button asChild variant="outline" className="w-1/2">
              <Link href="/">
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

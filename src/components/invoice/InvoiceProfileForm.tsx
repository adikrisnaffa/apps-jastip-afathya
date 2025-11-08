"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { doc, setDoc } from "firebase/firestore";
import { useFirestore, useUser, useDoc, useMemoFirebase } from "@/firebase";
import { useEffect } from "react";
import type { User as UserType } from "@/lib/types";

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
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";


const profileFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters." }),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function InvoiceProfileForm({ customerName }: { customerName: string }) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, "users", user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserType>(userDocRef);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
    },
    mode: "onChange",
  });
  
  useEffect(() => {
    if (userProfile) {
        form.reset({
            name: userProfile.name || customerName,
            phone: userProfile.phone || "",
            address: userProfile.address || "",
        });
    } else {
        form.reset({
             name: customerName,
             phone: "",
             address: "",
        })
    }
  }, [userProfile, customerName, form]);

  async function onSubmit(data: ProfileFormValues) {
    if (!firestore || !user || !userDocRef) {
      toast({
        title: "Error",
        description: "User or database is not available.",
        variant: "destructive",
      });
      return;
    }

    try {
      const profileData: Partial<UserType> = {
        id: user.uid,
        name: data.name,
        email: user.email || `${user.uid}@anonymous.jastip`, // Dummy email for anonymous
        phone: data.phone || "",
        address: data.address || "",
      };

      await setDoc(userDocRef, profileData, { merge: true });

      toast({
        title: "Information Saved!",
        description: "Your shipping details have been saved.",
      });
    } catch (error: any) {
      console.error("Error updating profile: ", error);
      toast({
        title: "Something went wrong",
        description: error.message || "Could not save your details.",
        variant: "destructive",
      });
    }
  }

  if (isProfileLoading) {
    return (
        <div className="space-y-8">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
        </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Your full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="e.g., +62 812 3456 7890" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Your full address for deliveries"
                  className="resize-y"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-4">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Details"
              )}
            </Button>
        </div>
      </form>
    </Form>
  );
}

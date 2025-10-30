"use client";

import { useState } from "react";
import { useAuth, useUser, useFirestore } from "@/firebase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Loader2, UserPlus, Mail, Key, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import Link from "next/link";
import type { User as UserType } from "@/lib/types";

export default function MasterPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) {
        toast({ title: "Error", description: "Authentication service not available.", variant: "destructive" });
        return;
    }
    
    if (!email || !password) {
        toast({ title: "Missing Fields", description: "Please enter both email and password.", variant: "destructive" });
        return;
    }
    
    setIsSubmitting(true);
    try {
      // This is a temporary auth instance to create the user without signing out the admin
      const tempAuth = auth;
      const userCredential = await createUserWithEmailAndPassword(tempAuth, email, password);
      const newUser = userCredential.user;
      
      // Create user profile in Firestore
      const userDocRef = doc(firestore, "users", newUser.uid);
      const newUserProfile: Omit<UserType, "id"> = {
          name: email.split('@')[0], // Default name from email
          email: newUser.email!,
      }
      await setDoc(userDocRef, newUserProfile);

      toast({
        title: "User Created",
        description: `Successfully created account for ${email}.`,
      });

      // We don't sign out the admin. The new user is created in the background.
      
      // Reset form
      setEmail("");
      setPassword("");
    } catch (error: any) {
      console.error("Failed to create user", error);
      toast({
        title: "Creation Failed",
        description: error.message || "Could not create the user account.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  if (isUserLoading) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading Master Data...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto max-w-4xl py-12 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You must be logged in to access the master management page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
       <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-headline text-primary">
            Master Control
            </h1>
            <p className="text-muted-foreground mt-2">
            Manage your application's core data.
            </p>
        </div>

        <Card className="shadow-lg max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Create New User</CardTitle>
                <CardDescription>
                    Add a new user account to the system.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleCreateUser}>
                <CardContent className="space-y-4">
                     <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                        type="email"
                        placeholder="new.user@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                        />
                    </div>
                    <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                        type="password"
                        placeholder="New Password (min. 6 characters)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between gap-4">
                    <Button asChild variant="outline" className="w-full">
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Link>
                    </Button>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        <UserPlus className="mr-2 h-5 w-5" />
                        {isSubmitting ? "Creating User..." : "Create User"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    </div>
  );
}

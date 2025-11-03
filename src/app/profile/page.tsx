"use client";

import { ProfileForm } from "@/components/profile/ProfileForm";
import { useUser } from "@/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Header from "@/components/layout/Header";

export default function ProfilePage() {
    const { user, isUserLoading } = useUser();

    if (isUserLoading) {
        return (
            <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] py-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Loading Profile...</p>
            </div>
        );
    }

    if (!user) {
        return (
             <div className="container mx-auto max-w-2xl py-12 px-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Access Denied</CardTitle>
                        <CardDescription>
                            You must be logged in to view your profile.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    return (
        <>
        <Header/>
        <main className="flex-grow">
        <div className="container mx-auto max-w-2xl py-12 px-4">
            <Card className="shadow-xl">
                 <CardHeader>
                    <CardTitle className="font-headline text-2xl">
                        My Profile
                    </CardTitle>
                    <CardDescription>
                        Update your personal information here.
                    </CardDescription>
                 </CardHeader>
                 <CardContent>
                    <ProfileForm />
                 </CardContent>
            </Card>
        </div>
        </main>
        </>
    );
}

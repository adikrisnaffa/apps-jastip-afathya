'use client';

import React, { useMemo, type ReactNode, useEffect, useState } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { onAuthStateChanged, Auth } from 'firebase/auth';
import { Skeleton } from '@/components/ui/skeleton';

function AuthGate({ children, auth }: { children: ReactNode, auth: Auth | null }) {
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        // This is the first confirmation of the auth state. It's now safe to render the app.
        setIsAuthReady(true);
        // We only need this for the initial load, so we unsubscribe immediately.
        unsubscribe(); 
      });

      // The returned function will be called on component unmount.
      // This is just for safety, as we unsubscribe above anyway.
      return () => unsubscribe();
    } else {
      // If there's no auth service, we can consider auth "ready" 
      // as there will be no authenticated user.
      setIsAuthReady(true);
    }
  }, [auth]);

  if (!isAuthReady) {
    // While we wait for the initial auth state, show a loading skeleton.
    // This prevents any child components from making Firestore queries too early.
    return (
        <div className="flex flex-col min-h-screen">
             <header className="bg-card shadow-md sticky top-0 z-40">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-8 w-24" />
                    </div>
                </div>
            </header>
            <main className="flex-grow container mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <Skeleton className="h-10 w-3/4 mx-auto" />
                    <Skeleton className="h-4 w-1/2 mx-auto mt-4" />
                </div>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="h-96 w-full" />
                    <Skeleton className="h-96 w-full" />
                    <Skeleton className="h-96 w-full" />
                </div>
            </main>
        </div>
    );
  }

  // Once auth is ready, render the actual application.
  return <>{children}</>;
}


interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    return initializeFirebase();
  }, []); 

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      <AuthGate auth={firebaseServices.auth}>
        {children}
      </AuthGate>
    </FirebaseProvider>
  );
}

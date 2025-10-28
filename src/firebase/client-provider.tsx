'use client';

import React, { useMemo, type ReactNode, useEffect, useState } from 'react';
import { FirebaseProvider, useAuth } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Skeleton } from '@/components/ui/skeleton';

function AuthGate({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        // As soon as we get any user state back (null or a user object),
        // we know auth is ready.
        setIsAuthReady(true);
        unsubscribe(); // We only need this for the initial check.
      });
      return () => unsubscribe();
    } else {
      // If auth service isn't even available, we can consider it "ready"
      // to show a state without a user.
      setIsAuthReady(true);
    }
  }, [auth]);

  if (!isAuthReady) {
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
      <AuthGate>
        {children}
      </AuthGate>
    </FirebaseProvider>
  );
}

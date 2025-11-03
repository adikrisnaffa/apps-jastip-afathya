import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { FirebaseClientProvider } from "@/firebase/client-provider";

export const metadata: Metadata = {
  title: "JasTip Express",
  description: "Your trusted personal shopping assistant.",
};

const AppFooter = () => {
  return (
    <footer className="bg-card text-card-foreground py-4 mt-auto">
      <div className="container mx-auto text-center text-sm text-muted-foreground">
        © Tukang Ngetest {new Date().getFullYear()}
      </div>
    </footer>
  );
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        <FirebaseClientProvider>
          <div className="flex-grow flex flex-col">
            {children}
          </div>
          <AppFooter />
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}

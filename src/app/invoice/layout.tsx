
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import "../globals.css";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import React from "react";

export const metadata: Metadata = {
  title: "Invoice - JasTip Express",
  description: "Your personal shopping invoice.",
};

export default function InvoiceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // This layout is a child of the RootLayout.
  // It should not render its own <html>, <head>, or <body> tags.
  // We wrap the providers and children in a React Fragment.
  return (
    <>
      {/* The RootLayout already includes FirebaseClientProvider, Toaster etc.
          However, to make this layout self-contained and not render the main
          Header, we need to provide the necessary context again for the
          invoice page to function correctly on its own when accessed directly.
          But since RootLayout wraps everything, we actually don't need a nested provider.
          The children will be rendered inside the RootLayout's main tag.
          The key is that this layout component itself doesn't render the Header.
      */}
      {children}
    </>
  );
}

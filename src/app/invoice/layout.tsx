
import type { Metadata } from "next";
import "../globals.css";
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
  // This layout is intentionally minimal and does not include the main Header or Footer.
  // It relies on the Firebase and Toaster providers from the RootLayout.
  return (
    <>
      {children}
    </>
  );
}

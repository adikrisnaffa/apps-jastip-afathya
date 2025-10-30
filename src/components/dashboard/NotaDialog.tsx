"use client";

import type { Order } from "@/lib/types";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "../ui/separator";

type NotaDialogProps = {
  orders: Order[];
  customerName: string;
};

export function NotaDialog({ orders, customerName, children }: NotaDialogProps & { children: ReactNode }) {
  const { toast } = useToast();
  
  const grandTotal = orders.reduce((acc, order) => acc + (order.price || 0) * order.quantity, 0);
  const firstOrderDate = orders[0]?.createdAt?.toDate();

  const handlePayment = () => {
    toast({
      title: "Payment Successful!",
      description: `Payment for ${customerName} has been processed.`,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[625px] bg-card printable-receipt">
        <DialogHeader className="sr-only">
          <DialogTitle>Invoice for {customerName}</DialogTitle>
          <DialogDescription>
            A printable invoice containing all order items and the grand total.
          </DialogDescription>
        </DialogHeader>
        <div className="print-header-section space-y-4">
            <div className="flex justify-between items-center">
                <Image 
                    src="/jastip-logo.png"
                    alt="Jastip.nya by Afathya"
                    width={150}
                    height={50}
                    priority
                />
                <h1 className="text-2xl font-bold uppercase text-primary">Invoice</h1>
            </div>
            <Separator />
            <div className="text-sm">
                <p><strong>Customer:</strong> {customerName}</p>
                <p><strong>Date:</strong> {firstOrderDate ? firstOrderDate.toLocaleDateString() : 'N/A'}</p>
            </div>
        </div>

        <div className="py-4 space-y-4">
          <div className="max-h-[400px] overflow-y-auto print-expand">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.itemDescription}</TableCell>
                    <TableCell className="text-center">{order.quantity}</TableCell>
                    <TableCell className="text-right">{formatRupiah(order.price || 0)}</TableCell>
                    <TableCell className="text-right">{formatRupiah((order.price || 0) * order.quantity)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow className="text-lg">
                  <TableCell colSpan={3} className="text-right font-bold">Grand Total</TableCell>
                  <TableCell className="text-right font-bold">{formatRupiah(grandTotal)}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
          <div className="space-y-2">
             <p className="font-semibold">Specific Requests:</p>
             <ul className="text-sm text-muted-foreground list-disc list-inside p-2 bg-muted rounded-md print-bg-transparent">
                {orders.filter(o => o.specificRequests).length > 0 ? (
                  orders.map(o => o.specificRequests && <li key={o.id}>{o.specificRequests}</li>)
                ) : (
                  <li>No specific requests.</li>
                )}
             </ul>
          </div>
        </div>
        <div className="print-hide">
          <Separator />
          <DialogFooter className="sm:justify-between gap-2 pt-4">
              <Button variant="outline" onClick={handlePrint}>Print</Button>
              <Button onClick={handlePayment} className="bg-accent hover:bg-accent/90 text-accent-foreground">Pay Now</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

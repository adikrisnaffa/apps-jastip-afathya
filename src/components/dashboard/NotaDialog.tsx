"use client";

import type { Order } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";
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
    // Note: window.print() will print the entire page. 
    // For a better experience, a dedicated printable component would be needed.
    window.print();
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[625px] bg-card">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-primary">Order Receipt</DialogTitle>
          <DialogDescription>
            Aggregated receipt for {customerName}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="text-sm text-muted-foreground">
            <p><strong>Date:</strong> {firstOrderDate ? firstOrderDate.toLocaleDateString() : 'N/A'}</p>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
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
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-bold text-lg">Grand Total</TableCell>
                  <TableCell className="text-right font-bold text-lg">{formatRupiah(grandTotal)}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
          <div className="space-y-2">
             <p className="font-semibold">Specific Requests:</p>
             <ul className="text-sm text-muted-foreground list-disc list-inside p-2 bg-muted rounded-md">
                {orders.map(o => o.specificRequests && <li key={o.id}>{o.specificRequests}</li>)}
             </ul>
          </div>
        </div>
        <Separator />
        <DialogFooter className="sm:justify-between gap-2">
            <Button variant="outline" onClick={handlePrint}>Print</Button>
            <Button onClick={handlePayment} className="bg-accent hover:bg-accent/90 text-accent-foreground">Pay Now</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

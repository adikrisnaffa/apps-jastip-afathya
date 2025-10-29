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
  order: Order;
};

export function NotaDialog({ order, children }: NotaDialogProps & { children: ReactNode }) {
  const { toast } = useToast();
  const total = (order.price || 0) * order.quantity;
  const orderDate = order.createdAt?.toDate();

  const handlePayment = () => {
    toast({
      title: "Payment Successful!",
      description: `Your payment for order ${order.id} has been processed.`,
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
      <DialogContent className="sm:max-w-[525px] bg-card">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-primary">Order Receipt</DialogTitle>
          <DialogDescription>
            Details for order #{order.id}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="text-sm text-muted-foreground">
            <p><strong>Date:</strong> {orderDate ? orderDate.toLocaleDateString() : 'N/A'}</p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">{order.itemDescription}</TableCell>
                <TableCell className="text-center">{order.quantity}</TableCell>
                <TableCell className="text-right">{formatRupiah(order.price || 0)}</TableCell>
                <TableCell className="text-right">{formatRupiah(total)}</TableCell>
              </TableRow>
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3} className="text-right font-bold text-lg">Grand Total</TableCell>
                <TableCell className="text-right font-bold text-lg">{formatRupiah(total)}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
          {order.specificRequests && (
            <div>
              <p className="font-semibold">Specific Requests:</p>
              <p className="text-sm text-muted-foreground p-2 bg-muted rounded-md">{order.specificRequests}</p>
            </div>
          )}
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

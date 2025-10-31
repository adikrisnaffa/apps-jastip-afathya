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
  
  const totalItemPrice = orders.reduce((acc, order) => acc + (order.price || 0) * order.quantity, 0);
  const totalJastipFee = orders.reduce((acc, order) => acc + (order.jastipFee || 0) * order.quantity, 0);
  const grandTotal = totalItemPrice + totalJastipFee;

  const firstOrderDate = orders[0]?.createdAt?.toDate();

  const handlePayment = () => {
    toast({
      title: "Payment Successful!",
      description: `Payment for ${customerName} has been processed.`,
    });
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=1000');
    if (!printWindow) {
      alert('Izinkan popup untuk mencetak invoice!');
      return;
    }
  
    // Ganti dengan path logo & tanda tangan kamu
    const logoUrl = `${window.location.origin}/jastip-logo.png`; // logo utama
    const signatureUrl = `${window.location.origin}/signature-afathya.png`; // tanda tangan
  
    // Tanggal hari ini
    const today = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  
    const primaryColor = '#f97316';
    const mutedBg = '#f9f9f9';
  
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Invoice - ${customerName}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: system-ui, -apple-system, sans-serif;
            padding: 2rem;
            background: white;
            color: #000;
            line-height: 1.5;
          }
          .container { max-width: 800px; margin: 0 auto; }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
          }
          .header img { height: 60px; }
          .invoice-title {
            font-size: 2rem;
            font-weight: bold;
            text-transform: uppercase;
            color: ${primaryColor};
          }
          .info { font-size: 0.95rem; margin-bottom: 1rem; }
          hr { border: none; border-top: 1px solid #ddd; margin: 1rem 0; }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 1.5rem 0;
            font-size: 0.95rem;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 0.6rem;
            text-align: left;
          }
          th {
            background-color: ${mutedBg};
            font-weight: 600;
            text-align: center;
          }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .font-bold { font-weight: bold; }
          .grand-total {
            background-color: ${mutedBg} !important;
            font-size: 1.1rem;
          }
          .grand-total .total-amount { color: ${primaryColor}; }
  
          .specific-requests { margin: 1.5rem 0; font-size: 0.95rem; }
          .specific-requests ul { margin: 0.5rem 0 0 1.2rem; color: #444; }
  
          /* Footer: Tanggal, Tanda Tangan, Nama Brand */
          .footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 3rem;
            font-size: 0.9rem;
            padding-top: 1rem;
            border-top: 1px dashed #ccc;
          }
          .footer-left { text-align: left; }
          .footer-right { text-align: right; }
          .signature-img { 
              height: 80px;        /* ← UBAH ANGKA INI */
              width: auto;         /* biar proporsi tetap */
              margin: 0.5rem 0; 
            }
          .brand-name {
            font-weight: bold;
            color: ${primaryColor};
            font-size: 1rem;
          }
  
          @media print {
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body { padding: 1.5rem; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- HEADER -->
          <div class="header">
            <img src="${logoUrl}" alt="Jastip.nya by Afathya" />
            <div class="invoice-title">Invoice</div>
          </div>
          <hr />
          <div class="info">
            <p><strong>Customer:</strong> ${customerName}</p>
            <p><strong>Date:</strong> ${firstOrderDate ? firstOrderDate.toLocaleDateString('id-ID') : 'N/A'}</p>
          </div>
  
          <!-- TABLE -->
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th class="text-center">Qty</th>
                <th class="text-right">Unit Price</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${orders.map(order => `
                <tr>
                  <td>${order.itemDescription}</td>
                  <td class="text-center">${order.quantity}</td>
                  <td class="text-right">${formatRupiah(order.price || 0)}</td>
                  <td class="text-right">${formatRupiah((order.price || 0) * order.quantity)}</td>
                </tr>
              `).join('')}
               ${totalJastipFee > 0 ? `
                <tr>
                  <td colspan="3" class="text-right">Total Jastip Fee</td>
                  <td class="text-right">${formatRupiah(totalJastipFee)}</td>
                </tr>
              ` : ''}
            </tbody>
            <tfoot>
              <tr class="grand-total">
                <td colspan="3" class="text-right font-bold">Grand Total</td>
                <td class="text-right font-bold total-amount">${formatRupiah(grandTotal)}</td>
              </tr>
            </tfoot>
          </table>
  
          <!-- SPECIFIC REQUESTS -->
          <div class="specific-requests">
            <p class="font-bold">Specific Requests:</p>
            <ul>
              ${orders.filter(o => o.specificRequests).length > 0
                ? orders.map(o => o.specificRequests ? `<li>${o.specificRequests}</li>` : '').join('')
                : '<li>No specific requests.</li>'
              }
            </ul>
          </div>
  
          <!-- FOOTER: Tanggal + Tanda Tangan + Brand -->
          <div class="footer">
            <div class="footer-left">
              <p><strong>Printed on:</strong> ${today}</p>
            </div>
            <div class="footer-right">
              <img src="${signatureUrl}" alt="Tanda Tangan" class="signature-img" />
              <div class="brand-name">Jastip.nya by Afathya</div>
            </div>
          </div>
        </div>
  
        <script>
          setTimeout(() => window.print(), 600);
          window.onafterprint = () => window.close();
        </script>
      </body>
      </html>
    `;
  
    printWindow.document.write(printContent);
    printWindow.document.close();
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
                {totalJastipFee > 0 && (
                  <TableRow>
                      <TableCell colSpan={3} className="text-right">Total Jastip Fee</TableCell>
                      <TableCell className="text-right">{formatRupiah(totalJastipFee)}</TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter className="bg-muted print-bg-transparent">
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

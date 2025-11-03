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
import { Copy, Link as LinkIcon } from "lucide-react";

type NotaDialogProps = {
  orders: Order[];
  customerName: string;
};

const paymentDetails = [
    { name: "BCA", number: "7641326767" },
    { name: "BSI", number: "7315234861" },
    { name: "Seabank", number: "901746352718" },
    { name: "Shopeepay", number: "089653008911" },
]

export function NotaDialog({ orders, customerName, children }: NotaDialogProps & { children: ReactNode }) {
  const { toast } = useToast();
  
  const grandTotal = orders.reduce((acc, order) => {
    const itemTotal = (order.price || 0) * order.quantity;
    const feeTotal = (order.jastipFee || 0) * order.quantity;
    return acc + itemTotal + feeTotal;
  }, 0);

  const firstOrderDate = orders[0]?.createdAt?.toDate();
  const eventId = orders[0]?.eventId;

  const handleCopyLink = () => {
    if (!eventId) {
      toast({
        title: "Error",
        description: "Cannot generate link without an event ID.",
        variant: "destructive",
      });
      return;
    }
    const link = `${window.location.origin}/invoice/${eventId}/${encodeURIComponent(customerName)}`;
    navigator.clipboard.writeText(link).then(() => {
        toast({
            title: "Link Copied!",
            description: "Invoice link copied to clipboard.",
        })
    }).catch(err => {
        console.error("Failed to copy link:", err);
        toast({
            title: "Copy Failed",
            description: "Could not copy the invoice link.",
            variant: "destructive"
        })
    });
  };

  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
        toast({
            title: "Copied to Clipboard",
            description: `${label} (${text}) berhasil disalin.`,
        })
    }).catch(err => {
        console.error("Failed to copy:", err);
        toast({
            title: "Copy Failed",
            description: "Could not copy text to clipboard.",
            variant: "destructive"
        })
    });
  }

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
          .header img { height: 100px; }
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
  
          .details-section { margin: 1.5rem 0; font-size: 0.9rem; }
          .details-section h3 { font-size: 1rem; font-weight: 600; margin-bottom: 0.5rem; color: #333; }
          .details-section ul { margin: 0.5rem 0 0 1.2rem; color: #444; list-style-type: none; padding-left: 0;}
          .details-section li { margin-bottom: 0.25rem; }

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
              height: 80px;
              width: auto;
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
                <th class="text-right">Item Price</th>
                <th class="text-right">Jastip Fee</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${orders.map(order => `
                <tr>
                  <td>${order.itemDescription}</td>
                  <td class="text-center">${order.quantity}</td>
                  <td class="text-right">${formatRupiah(order.price || 0)}</td>
                  <td class="text-right">${formatRupiah(order.jastipFee || 0)}</td>
                  <td class="text-right">${formatRupiah(((order.price || 0) + (order.jastipFee || 0)) * order.quantity)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr class="grand-total">
                <td colspan="4" class="text-right font-bold">Grand Total</td>
                <td class="text-right font-bold total-amount">${formatRupiah(grandTotal)}</td>
              </tr>
            </tfoot>
          </table>
  
          <!-- DETAILS SECTION -->
          <div class="details-section">
            <h3>Specific Requests:</h3>
            <ul>
              ${orders.filter(o => o.specificRequests).length > 0
                ? orders.map(o => o.specificRequests ? `<li>- ${o.specificRequests}</li>` : '').join('')
                : '<li>- No specific requests.</li>'
              }
            </ul>
          </div>

          <div class="details-section">
            <h3>Payment Details:</h3>
            <p>TF hanya atas nama <strong>Fathya Athifah</strong></p>
            <ul>
                <li><strong>BCA:</strong> 7641326767</li>
                <li><strong>BSI:</strong> 7315234861</li>
                <li><strong>Seabank:</strong> 901746352718</li>
                <li><strong>Shopeepay:</strong> 089653008911</li>
            </ul>
          </div>

           <div class="details-section">
                <h3>Notes:</h3>
                <ul>
                    <li>- TF maksimal 1x24jam</li>
                    <li>- mohon kirimkan bukti transfernya yaa kak</li>
                    <li>- masih boleh nambah order kok ;)</li>
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
      <DialogContent className="sm:max-w-[725px] bg-card printable-receipt">
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
                    height={100}
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
          <div className="max-h-[300px] overflow-y-auto print-expand">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-right">Item Price</TableHead>
                  <TableHead className="text-right">Jastip Fee</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.itemDescription}</TableCell>
                    <TableCell className="text-center">{order.quantity}</TableCell>
                    <TableCell className="text-right">{formatRupiah(order.price || 0)}</TableCell>
                    <TableCell className="text-right">{formatRupiah(order.jastipFee || 0)}</TableCell>
                    <TableCell className="text-right">{formatRupiah(((order.price || 0) + (order.jastipFee || 0)) * order.quantity)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter className="bg-muted print-bg-transparent">
                <TableRow className="text-lg">
                  <TableCell colSpan={4} className="text-right font-bold">Grand Total</TableCell>
                  <TableCell className="text-right font-bold">{formatRupiah(grandTotal)}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
          <div className="space-y-4 text-sm">
             <div>
                <p className="font-semibold">Specific Requests:</p>
                <ul className="text-muted-foreground list-disc list-inside p-2 bg-muted rounded-md print-bg-transparent">
                    {orders.filter(o => o.specificRequests).length > 0 ? (
                    orders.map(o => o.specificRequests && <li key={o.id}>{o.specificRequests}</li>)
                    ) : (
                    <li>No specific requests.</li>
                    )}
                </ul>
             </div>
             <div>
                <p className="font-semibold">Payment Details:</p>
                <div className="p-2 bg-muted rounded-md print-bg-transparent">
                    <p className="text-muted-foreground">TF hanya atas nama <strong>Fathya Athifah</strong></p>
                     <ul className="text-muted-foreground list-none space-y-2 mt-2">
                        {paymentDetails.map(detail => (
                             <li key={detail.name} className="flex justify-between items-center">
                                <span><strong>{detail.name}:</strong> {detail.number}</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCopyToClipboard(detail.number, detail.name)}
                                    className="h-7 px-2"
                                >
                                    <Copy className="h-3 w-3 mr-1" />
                                    Copy
                                </Button>
                            </li>
                        ))}
                    </ul>
                </div>
             </div>
              <div>
                <p className="font-semibold">Notes:</p>
                <ul className="text-muted-foreground list-disc list-inside p-2 bg-muted rounded-md print-bg-transparent">
                    <li>TF maksimal 1x24jam</li>
                    <li>mohon kirimkan bukti transfernya yaa kak</li>
                    <li>masih boleh nambah order kok ;)</li>
                </ul>
              </div>
          </div>
        </div>
        <div className="print-hide">
          <Separator />
          <DialogFooter className="sm:justify-between gap-2 pt-4">
              <Button variant="outline" onClick={handlePrint}>Print</Button>
              <Button onClick={handleCopyLink} variant="secondary">
                <LinkIcon className="mr-2 h-4 w-4" />
                Copy Link
              </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}


"use client";

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import type { JastipEvent, Order } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Frown } from 'lucide-react';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';

const paymentDetails = [
    { name: "BCA", number: "7641326767" },
    { name: "BSI", number: "7315234861" },
    { name: "Seabank", number: "901746352718" },
    { name: "Shopeepay", number: "089653008911" },
];

const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};


function InvoiceView({ event, orders, customerName }: { event: JastipEvent, orders: Order[], customerName: string }) {
    const grandTotal = orders.reduce((acc, order) => {
        const itemTotal = (order.price || 0) * order.quantity;
        const feeTotal = (order.jastipFee || 0) * order.quantity;
        return acc + itemTotal + feeTotal;
    }, 0);

    const firstOrderDate = orders[0]?.createdAt?.toDate();

    return (
         <Card className="w-full max-w-4xl mx-auto shadow-2xl">
            <CardContent className="p-6 sm:p-10">
                 <div className="space-y-4">
                    <div className="flex justify-between items-center flex-wrap gap-4">
                        <Image 
                            src="/jastip-logo.png"
                            alt="Jastip.nya by Afathya"
                            width={150}
                            height={100}
                            priority
                        />
                        <h1 className="text-3xl font-bold uppercase text-primary">Invoice</h1>
                    </div>
                    <Separator />
                    <div className="text-sm text-muted-foreground grid grid-cols-2 gap-4">
                        <div>
                            <p className="font-semibold text-foreground">Billed To:</p>
                            <p>{decodeURIComponent(customerName)}</p>
                        </div>
                         <div className="text-right">
                             <p className="font-semibold text-foreground">Event:</p>
                            <p>{event.name}</p>
                             <p className="font-semibold text-foreground mt-2">Invoice Date:</p>
                            <p>{firstOrderDate ? firstOrderDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}</p>
                        </div>
                    </div>
                </div>

                <div className="py-6 space-y-6">
                    <div className="overflow-x-auto">
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
                        <TableFooter className="bg-muted">
                            <TableRow className="text-lg">
                            <TableCell colSpan={4} className="text-right font-bold">Grand Total</TableCell>
                            <TableCell className="text-right font-bold text-primary">{formatRupiah(grandTotal)}</TableCell>
                            </TableRow>
                        </TableFooter>
                        </Table>
                    </div>
                    <div className="space-y-4 text-sm">
                        <div>
                            <p className="font-semibold">Specific Requests:</p>
                            <ul className="text-muted-foreground list-disc list-inside p-2 bg-muted rounded-md">
                                {orders.filter(o => o.specificRequests).length > 0 ? (
                                orders.map(o => o.specificRequests && <li key={o.id}>{o.specificRequests}</li>)
                                ) : (
                                <li>No specific requests.</li>
                                )}
                            </ul>
                        </div>
                        <div>
                            <p className="font-semibold">Payment Details:</p>
                            <div className="p-4 bg-muted rounded-md text-muted-foreground">
                                <p>TF hanya atas nama <strong>Fathya Athifah</strong></p>
                                <ul className="list-none space-y-1 mt-2">
                                    {paymentDetails.map(detail => (
                                        <li key={detail.name}>
                                            <strong>{detail.name}:</strong> {detail.number}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div>
                            <p className="font-semibold">Notes:</p>
                            <ul className="text-muted-foreground list-disc list-inside p-2 bg-muted rounded-md">
                                <li>TF maksimal 1x24jam</li>
                                <li>mohon kirimkan bukti transfernya yaa kak</li>
                                <li>masih boleh nambah order kok ;)</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default function PublicInvoicePage() {
    const params = useParams();
    const eventId = params.eventId as string;
    const customerName = decodeURIComponent(params.customerName as string);

    const firestore = useFirestore();

    const eventRef = useMemoFirebase(() => {
        if (!firestore || !eventId) return null;
        return doc(firestore, 'events', eventId);
    }, [firestore, eventId]);

    const ordersQuery = useMemoFirebase(() => {
        if (!firestore || !eventId || !customerName) return null;
        return query(
            collection(firestore, 'orders'),
            where('eventId', '==', eventId),
            where('customerName', '==', customerName)
        );
    }, [firestore, eventId, customerName]);

    const { data: event, isLoading: isEventLoading } = useDoc<JastipEvent>(eventRef);
    const { data: orders, isLoading: areOrdersLoading } = useCollection<Order>(ordersQuery);

    const isLoading = isEventLoading || areOrdersLoading;

    if (isLoading) {
        return (
            <div className="container mx-auto py-12 px-4">
                <div className="w-full max-w-4xl mx-auto space-y-6">
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-16 w-48" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                    <Skeleton className="h-px w-full" />
                     <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
            </div>
        )
    }

    if (!event || !orders || orders.length === 0) {
        return (
            <div className="container mx-auto py-12 px-4 text-center">
                <Alert variant="destructive" className="max-w-md mx-auto">
                    <Frown className="h-4 w-4" />
                    <AlertTitle>Invoice Not Found</AlertTitle>
                    <AlertDescription>
                        The requested invoice could not be found. The link may be invalid or the orders may have been deleted.
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="bg-background min-h-screen py-12 px-4">
            <InvoiceView event={event} orders={orders} customerName={customerName} />
        </div>
    );
}
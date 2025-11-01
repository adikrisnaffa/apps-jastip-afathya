"use client";

import { useState, useRef, type ReactNode } from "react";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UploadCloud, File, AlertTriangle, Loader2 } from "lucide-react";
import { useFirestore, useUser } from "@/firebase";
import { writeBatch, collection, doc, Timestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { logActivity } from "@/lib/activity-logger";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";


type ImportDialogProps = {
  eventId: string;
  children: ReactNode;
  onImporting: (isImporting: boolean) => void;
};

type ParsedOrder = {
    customerName: string;
    itemDescription: string;
    quantity: number;
    price: number;
    originalPrice?: number;
    jastipFee: number;
    specificRequests?: string;
}

const REQUIRED_COLUMNS = ["Customer Name", "Item Description", "Quantity", "Price (per item)", "Jastip Fee (per item)"];
// Original Price is optional
const OPTIONAL_COLUMNS = ["Original Price (per item)", "Specific Requests"];


export function ImportDialog({ eventId, children, onImporting }: ImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedOrder[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const resetState = () => {
    setFile(null);
    setParsedData([]);
    setError(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
        if (selectedFile.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            setError("Invalid file type. Please upload an Excel file (.xlsx).");
            setFile(null);
            setParsedData([]);
            return;
        }
        setFile(selectedFile);
        parseExcel(selectedFile);
    }
  };

  const parseExcel = (fileToParse: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet) as any[];

        if (json.length === 0) {
            setError("The Excel file is empty or has an invalid format.");
            setParsedData([]);
            return;
        }

        const headers = Object.keys(json[0]);
        const missingHeaders = REQUIRED_COLUMNS.filter(col => !headers.includes(col));
        if (missingHeaders.length > 0) {
            setError(`Missing required columns: ${missingHeaders.join(', ')}.`);
            setParsedData([]);
            return;
        }

        const orders: ParsedOrder[] = json.map(row => ({
            customerName: String(row["Customer Name"] || ""),
            itemDescription: String(row["Item Description"] || ""),
            quantity: Number(row["Quantity"] || 1),
            price: Number(row["Price (per item)"] || 0),
            originalPrice: Number(row["Original Price (per item)"] || 0),
            jastipFee: Number(row["Jastip Fee (per item)"] || 0),
            specificRequests: String(row["Specific Requests"] || ""),
        })).filter(order => order.customerName && order.itemDescription); // Basic validation

        if(orders.length === 0) {
            setError("No valid orders found in the file. Make sure 'Customer Name' and 'Item Description' are filled out.");
            setParsedData([]);
            return;
        }

        setParsedData(orders);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to parse the Excel file. Please check the format.");
        setParsedData([]);
      }
    };
    reader.readAsArrayBuffer(fileToParse);
  };

  const handleImport = async () => {
    if (!firestore || !user || parsedData.length === 0) return;
    onImporting(true);

    try {
        const batch = writeBatch(firestore);
        const ordersCollection = collection(firestore, "orders");
        
        parsedData.forEach(orderData => {
            const newOrderRef = doc(ordersCollection); // Create a new doc with a generated ID
            const newOrder = {
                ...orderData,
                id: newOrderRef.id,
                eventId: eventId,
                userId: user.uid,
                createdAt: Timestamp.now(),
                status: "Not Paid" as const,
            };
            batch.set(newOrderRef, newOrder);
        });

        await batch.commit();

        logActivity(
            firestore,
            user,
            "CREATE",
            "Order",
            `batch-import-${Date.now()}`,
            `Imported ${parsedData.length} orders for event ${eventId}.`
        );

        toast({
            title: "Import Successful!",
            description: `${parsedData.length} orders have been added.`
        });

        setIsOpen(false);
        resetState();

    } catch (err: any) {
        console.error(err);
        toast({
            title: "Import Failed",
            description: err.message || "An error occurred while saving the orders.",
            variant: "destructive"
        });
    } finally {
        onImporting(false);
    }
  }
  
  const handleTriggerClick = () => {
    resetState();
    setIsOpen(true);
  }

  const handleDialogClose = () => {
    resetState();
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild onClick={handleTriggerClick}>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-4xl" onInteractOutside={handleDialogClose}>
        <DialogHeader>
          <DialogTitle>Import Orders from Excel</DialogTitle>
          <DialogDescription>
            Upload an .xlsx file with your orders. Make sure the columns match the required format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
            <div 
                className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted"
                onClick={() => fileInputRef.current?.click()}
            >
                <UploadCloud className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                    {file ? file.name : "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-muted-foreground">Excel file (.xlsx)</p>
                <input 
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".xlsx"
                    onChange={handleFileChange}
                />
            </div>

            {error && (
                 <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Import Error</AlertTitle>
                    <AlertDescription>
                        {error}
                    </AlertDescription>
                </Alert>
            )}

            {parsedData.length > 0 && (
                 <div className="space-y-2">
                    <h3 className="font-semibold">Preview Data ({parsedData.length} orders found)</h3>
                    <div className="border rounded-md max-h-64 overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Item</TableHead>
                                    <TableHead className="text-center">Qty</TableHead>
                                    <TableHead className="text-right">Price</TableHead>
                                    <TableHead className="text-right">Fee</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {parsedData.map((order, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{order.customerName}</TableCell>
                                        <TableCell>{order.itemDescription}</TableCell>
                                        <TableCell className="text-center">{order.quantity}</TableCell>
                                        <TableCell className="text-right">{order.price}</TableCell>
                                        <TableCell className="text-right">{order.jastipFee}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}
        </div>

        <DialogFooter>
            <Button variant="outline" onClick={handleDialogClose}>Cancel</Button>
            <Button onClick={handleImport} disabled={parsedData.length === 0}>
                Import {parsedData.length > 0 ? parsedData.length : ''} Orders
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

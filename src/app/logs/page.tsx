"use client";

import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import type { ActivityLog } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert, History, Loader2, ArrowLeft } from "lucide-react";
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";


function ActionBadge({ action }: { action: ActivityLog['action'] }) {
    const variants: Record<ActivityLog['action'], string> = {
        CREATE: 'bg-green-500 hover:bg-green-500/80',
        UPDATE: 'bg-blue-500 hover:bg-blue-500/80',
        DELETE: 'bg-red-500 hover:bg-red-500/80',
    };
    return <Badge className={cn("text-white", variants[action])}>{action}</Badge>
}

export default function LogsPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const logsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'activity_logs'), orderBy('timestamp', 'desc'));
    }, [firestore]);

    const { data: logs, isLoading: isLogsLoading } = useCollection<ActivityLog>(logsQuery);

    if (isUserLoading) {
        return (
            <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] py-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Verifying Access...</p>
            </div>
        );
    }

    if (!user) {
        return (
             <div className="container mx-auto max-w-4xl py-12 px-4">
                <Alert variant="destructive">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertTitle>Access Denied</AlertTitle>
                    <AlertDescription>
                        You must be logged in to view the activity logs.
                    </AlertDescription>
                </Alert>
            </div>
        )
    }


    return (
        <div className="container mx-auto max-w-6xl py-12 px-4">
            <Card className="shadow-xl">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2">
                        <History className="h-6 w-6 text-primary" />
                        Activity Logs
                    </CardTitle>
                    <CardDescription>
                        A log of all significant actions performed by users in the application.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLogsLoading ? (
                        <div className="space-y-2">
                           <Skeleton className="h-12 w-full" />
                           <Skeleton className="h-12 w-full" />
                           <Skeleton className="h-12 w-full" />
                           <Skeleton className="h-12 w-full" />
                        </div>
                    ) : logs && logs.length > 0 ? (
                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[200px]">Timestamp</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Action</TableHead>
                                        <TableHead>Entity</TableHead>
                                        <TableHead>Details</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {log.timestamp ? format(log.timestamp.toDate(), 'PPpp') : 'N/A'}
                                            </TableCell>
                                            <TableCell className="font-medium">{log.userEmail}</TableCell>
                                            <TableCell><ActionBadge action={log.action} /></TableCell>
                                            <TableCell>{log.entityType}</TableCell>
                                            <TableCell className="text-sm">{log.details}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                         <Alert>
                            <History className="h-4 w-4" />
                            <AlertTitle>No Logs Found</AlertTitle>
                            <AlertDescription>
                                There are no activity logs to display yet. Perform some actions in the app to see logs here.
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
                <CardFooter>
                    <Button asChild variant="outline">
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
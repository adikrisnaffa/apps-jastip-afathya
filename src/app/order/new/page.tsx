import { OrderForm } from "@/components/order/OrderForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewOrderPage() {
  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <div className="relative text-center mb-8">
        <Button
          asChild
          variant="outline"
          className="absolute left-0 top-1/2 -translate-y-1/2"
        >
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-4xl font-bold font-headline text-primary">
            Submit a New Order
          </h1>
          <p className="text-muted-foreground mt-2">
            Tell us what you're looking for, and we'll handle the rest.
          </p>
        </div>
      </div>
      <OrderForm />
    </div>
  );
}

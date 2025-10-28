import { OrderForm } from "@/components/order/OrderForm";

export default function NewOrderPage() {
  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <div className="relative text-center mb-8">
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

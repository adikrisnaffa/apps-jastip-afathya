import Link from "next/link";
import { PackageOpen } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-card shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold font-headline text-primary">
            <PackageOpen className="h-7 w-7" />
            <span>JasTip Express</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

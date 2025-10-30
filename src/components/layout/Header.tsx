"use client";

import Link from "next/link";
import { User as UserIcon, LogOut, LogIn, UserCircle2, Database, ScrollText } from "lucide-react";
import Image from "next/image";
import { useAuth, useUser } from "@/firebase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";

export default function Header() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  
  const handleLogout = async () => {
    if(auth) {
        await auth.signOut();
    }
  };

  return (
    <header className="bg-card shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link
            href="/"
            className="flex items-center gap-2"
          >
            <Image 
                src="/jastip-logo.png"
                alt="Jastip.nya by Afathya"
                width={150}
                height={50}
                priority
            />
          </Link>
          <div className="flex items-center gap-4">
            {isUserLoading && <Skeleton className="h-8 w-24" />}
            {!isUserLoading && user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />}
                      <AvatarFallback>
                        <UserIcon/>
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.displayName || (user.isAnonymous ? 'Anonymous User' : 'Jastip User')}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.phoneNumber || user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                        <UserCircle2 className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                      <Link href="/master">
                          <Database className="mr-2 h-4 w-4" />
                          <span>Master</span>
                      </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                      <Link href="/logs">
                          <ScrollText className="mr-2 h-4 w-4" />
                          <span>Activity Logs</span>
                      </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
             {!isUserLoading && !user && (
                 <Button asChild>
                     <Link href="/login">
                        <LogIn className="mr-2 h-4 w-4"/>
                        Login
                     </Link>
                 </Button>
             )}
          </div>
        </div>
      </div>
    </header>
  );
}

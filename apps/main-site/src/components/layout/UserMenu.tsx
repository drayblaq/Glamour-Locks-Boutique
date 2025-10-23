'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Package, LogOut } from 'lucide-react';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';

export default function UserMenu() {
  const { customer, logout, isAuthenticated } = useCustomerAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!isAuthenticated || !customer) {
    return (
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/login')}
          className="text-primary hover:text-primary/80"
        >
          Connexion
        </Button>
        <Button 
          onClick={() => router.push('/register')}
          className="bg-primary hover:bg-primary/90"
        >
          S'inscrire
        </Button>
      </div>
    );
  }

  const initials = `${customer.firstName.charAt(0)}${customer.lastName.charAt(0)}`.toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {customer.firstName} {customer.lastName}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {customer.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => router.push('/account')}
          className="cursor-pointer"
        >
          <User className="mr-2 h-4 w-4" />
          <span>Mon Compte</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => router.push('/account')}
          className="cursor-pointer"
        >
          <Package className="mr-2 h-4 w-4" />
          <span>Mes Commandes</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleLogout}
          className="cursor-pointer text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Se Déconnecter</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}





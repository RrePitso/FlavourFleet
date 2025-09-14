import React from "react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";
import { Utensils, ShoppingCart, User } from "lucide-react";

interface NavbarProps {
  title?: string;
  cartItemCount?: number;
  rightContent?: React.ReactNode;
}

export default function Navbar({ title = "LocalEats", cartItemCount = 0, rightContent }: NavbarProps) {
  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="bg-card shadow-sm border-b border-border sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-primary flex items-center gap-2">
              <Utensils className="h-5 w-5" />
              {title}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {rightContent}
            
            {user?.role === "customer" && cartItemCount > 0 && (
              <button className="p-2 hover:bg-secondary rounded-full relative" data-testid="button-cart">
                <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              </button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="p-2 hover:bg-secondary rounded-full"
              data-testid="button-signout"
            >
              <User className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

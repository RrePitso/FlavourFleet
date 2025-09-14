import React, { useState } from "react";
import { Restaurant, MenuItem } from "@shared/schema";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RestaurantModalProps {
  restaurant: Restaurant;
  onClose: () => void;
}

export default function RestaurantModal({ restaurant, onClose }: RestaurantModalProps) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  const handleAddToCart = (menuItem: MenuItem) => {
    if (!menuItem.available) return;
    
    addItem({
      menuItemId: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: 1,
    });

    toast({
      title: "Added to cart",
      description: `${menuItem.name} has been added to your cart`,
    });
  };

  // Group menu items by category
  const itemsByCategory = restaurant.menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {restaurant.name} Menu
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="p-1 h-auto"
              data-testid="button-close-modal"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {Object.entries(itemsByCategory).map(([category, items]) => (
            <div key={category}>
              <h3 className="font-medium text-lg mb-3 capitalize">{category}</h3>
              <div className="space-y-3">
                {items.map(item => (
                  <div 
                    key={item.id} 
                    className="flex items-start gap-3 p-3 border border-border rounded-lg"
                    data-testid={`item-${item.id}`}
                  >
                    <div className="w-16 h-16 bg-gradient-to-r from-primary/10 to-accent/10 rounded flex items-center justify-center">
                      <span className="text-xs text-center font-medium text-muted-foreground">
                        {item.name.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">${item.price.toFixed(2)}</span>
                        <Button
                          size="sm"
                          onClick={() => handleAddToCart(item)}
                          disabled={!item.available}
                          className="flex items-center gap-1"
                          data-testid={`button-add-${item.id}`}
                        >
                          <Plus className="h-3 w-3" />
                          {item.available ? "Add to Cart" : "Unavailable"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

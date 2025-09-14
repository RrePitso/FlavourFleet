import React, { useState } from "react";
import { MenuItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { updateMenuItem, getRestaurantById } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

interface AddItemModalProps {
  restaurantId: string;
  onClose: () => void;
  onAdd: (item: MenuItem) => void;
}

export default function AddItemModal({ restaurantId, onClose, onAdd }: AddItemModalProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    available: true,
  });

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const restaurant = await getRestaurantById(restaurantId);
      if (!restaurant) throw new Error("Restaurant not found");

      const newItem: MenuItem = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        available: formData.available,
      };

      const updatedItems = [...restaurant.menuItems, newItem];
      await updateMenuItem(restaurantId, updatedItems);
      
      onAdd(newItem);
      handleClose();
      
      toast({
        title: "Item added",
        description: "Menu item has been added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add menu item",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Add New Menu Item
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
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Item Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter item name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              data-testid="input-name"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter item description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              data-testid="textarea-description"
            />
          </div>
          
          <div>
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
              data-testid="input-price"
            />
          </div>
          
          <div>
            <Label htmlFor="category">Category</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger data-testid="select-category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pizzas">Pizzas</SelectItem>
                <SelectItem value="beverages">Beverages</SelectItem>
                <SelectItem value="desserts">Desserts</SelectItem>
                <SelectItem value="appetizers">Appetizers</SelectItem>
                <SelectItem value="mains">Main Courses</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="available"
              checked={formData.available}
              onCheckedChange={(checked) => setFormData({ ...formData, available: !!checked })}
              data-testid="checkbox-available"
            />
            <Label htmlFor="available">Available for order</Label>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
              data-testid="button-submit"
            >
              {loading ? "Adding..." : "Add Item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

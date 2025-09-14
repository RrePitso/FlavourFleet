import React, { useState } from "react";
import { Restaurant, MenuItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { updateMenuItem } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";
import AddItemModal from "./AddItemModal";
import { Plus, Edit, Trash2 } from "lucide-react";

interface MenuManagementProps {
  restaurant: Restaurant;
}

export default function MenuManagement({ restaurant }: MenuManagementProps) {
  const { toast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [menuItems, setMenuItems] = useState(restaurant.menuItems);

  const handleToggleAvailability = async (itemId: string, available: boolean) => {
    try {
      const updatedItems = menuItems.map(item =>
        item.id === itemId ? { ...item, available } : item
      );
      
      await updateMenuItem(restaurant.id, updatedItems);
      setMenuItems(updatedItems);
      
      toast({
        title: "Menu updated",
        description: `Item ${available ? "enabled" : "disabled"} successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update menu item",
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const updatedItems = menuItems.filter(item => item.id !== itemId);
      await updateMenuItem(restaurant.id, updatedItems);
      setMenuItems(updatedItems);
      
      toast({
        title: "Item deleted",
        description: "Menu item has been removed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete menu item",
        variant: "destructive",
      });
    }
  };

  const handleAddItem = (newItem: MenuItem) => {
    const updatedItems = [...menuItems, newItem];
    setMenuItems(updatedItems);
  };

  // Group items by category
  const itemsByCategory = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Menu Management</h2>
        <Button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2"
          data-testid="button-add-item"
        >
          <Plus className="h-4 w-4" />
          Add New Item
        </Button>
      </div>

      <div className="space-y-6">
        {Object.entries(itemsByCategory).map(([category, items]) => (
          <div key={category} className="bg-card p-4 rounded-lg shadow-sm border border-border">
            <h3 className="font-medium text-lg mb-4 capitalize">{category}</h3>
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex items-start gap-3 p-3 border border-border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{item.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.available 
                            ? "bg-green-100 text-green-800" 
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {item.available ? "Available" : "Out of Stock"}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 h-auto"
                          data-testid={`button-edit-${item.id}`}
                        >
                          <Edit className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1 h-auto"
                          data-testid={`button-delete-${item.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">${item.price.toFixed(2)}</span>
                      <Switch
                        checked={item.available}
                        onCheckedChange={(checked) => handleToggleAvailability(item.id, checked)}
                        data-testid={`switch-${item.id}`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {Object.keys(itemsByCategory).length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No menu items yet</p>
            <p className="text-sm text-muted-foreground">Add your first menu item to get started</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <AddItemModal
          restaurantId={restaurant.id}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddItem}
        />
      )}
    </div>
  );
}

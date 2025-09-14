import React from "react";
import { Order } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { updateOrder } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Phone, CreditCard, Banknote } from "lucide-react";

interface DeliveryCardProps {
  order: Order;
  onAccept?: () => void;
  type: "available" | "active";
}

export default function DeliveryCard({ order, onAccept, type }: DeliveryCardProps) {
  const { toast } = useToast();

  const handleUpdateStatus = async (newStatus: Order["status"]) => {
    try {
      await updateOrder(order.id, { status: newStatus });
      toast({
        title: "Order updated",
        description: `Order marked as ${newStatus.replace("_", " ")}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const getBorderColor = () => {
    if (type === "available") return "border-l-primary";
    if (order.status === "picked_up") return "border-l-accent";
    return "border-l-green-500";
  };

  const getStatusBadge = () => {
    if (type === "available") {
      return (
        <span className="bg-primary/20 text-primary px-2 py-1 rounded-full text-xs font-medium">
          ${(order.totalAmount * 0.1).toFixed(2)} delivery fee
        </span>
      );
    }
    
    const statusColors = {
      picked_up: "bg-accent/20 text-accent-foreground",
      out_for_delivery: "bg-primary/20 text-primary",
    };
    
    const color = statusColors[order.status as keyof typeof statusColors] || "bg-muted text-muted-foreground";
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        {order.status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
      </span>
    );
  };

  return (
    <div className={`bg-card p-4 rounded-lg shadow-sm border border-border border-l-4 ${getBorderColor()}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-medium">{order.restaurantName} → {order.customerAddress}</h3>
          <p className="text-sm text-muted-foreground">Order #{order.id.slice(-6)} • 2.3 miles</p>
        </div>
        {getStatusBadge()}
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="text-sm">
          <span className="font-medium">Items:</span>{" "}
          {order.items.map(item => `${item.quantity}x ${item.name}`).join(", ")}
        </div>
        <div className="text-sm flex items-center gap-1">
          <span className="font-medium">Payment:</span>
          {order.paymentMethod === "cash" ? (
            <>
              <Banknote className="h-4 w-4" />
              Cash on delivery
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4" />
              Bank transfer
            </>
          )}
        </div>
        <div className="text-sm">
          <span className="font-medium">Customer:</span> {order.customerName}
        </div>
        <div className="text-sm flex items-center gap-1">
          <Phone className="h-4 w-4" />
          {order.customerPhone}
        </div>
        <div className="text-sm flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          {order.customerAddress}
        </div>
      </div>

      {type === "available" ? (
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" data-testid="button-view-route">
            View Route
          </Button>
          <Button 
            className="flex-1"
            onClick={onAccept}
            data-testid={`button-accept-${order.id}`}
          >
            Accept Delivery
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button
              variant={order.status === "picked_up" ? "outline" : "default"}
              onClick={() => handleUpdateStatus("picked_up")}
              disabled={order.status !== "ready"}
              data-testid="button-mark-picked-up"
            >
              Mark as Picked Up
            </Button>
            <Button
              variant={order.status === "out_for_delivery" ? "default" : "outline"}
              onClick={() => handleUpdateStatus("delivered")}
              disabled={order.status !== "picked_up"}
              className="bg-green-600 hover:bg-green-700"
              data-testid="button-mark-delivered"
            >
              Mark as Delivered
            </Button>
          </div>
          
          <Button variant="outline" className="w-full" data-testid="button-call-customer">
            <Phone className="h-4 w-4 mr-2" />
            Call Customer
          </Button>
        </div>
      )}
    </div>
  );
}

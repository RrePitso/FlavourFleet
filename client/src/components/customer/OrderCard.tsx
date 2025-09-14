import React from "react";
import { Order } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { createOrder } from "@/lib/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Clock, MapPin, Phone, CreditCard, Banknote, CheckCircle, Truck } from "lucide-react";

interface OrderCardProps {
  order: Order;
  isHistory?: boolean;
}

const statusConfig = {
  pending: { label: "Order Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
  preparing: { label: "Being Prepared", color: "bg-orange-100 text-orange-800", icon: Clock },
  ready: { label: "Ready for Pickup", color: "bg-green-100 text-green-800", icon: CheckCircle },
  picked_up: { label: "Picked Up", color: "bg-purple-100 text-purple-800", icon: Truck },
  out_for_delivery: { label: "Out for Delivery", color: "bg-accent/20 text-accent-foreground", icon: Truck },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-800", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800", icon: Clock },
};

export default function OrderCard({ order, isHistory = false }: OrderCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const status = statusConfig[order.status];
  const StatusIcon = status.icon;

  const handleReorder = async () => {
    if (!user) return;

    try {
      await createOrder({
        customerId: user.id,
        customerName: user.name,
        customerPhone: user.phone || "",
        customerAddress: user.address || "",
        restaurantId: order.restaurantId,
        restaurantName: order.restaurantName,
        items: order.items,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        status: "pending",
      });

      toast({
        title: "Order placed!",
        description: "Your order has been placed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getOrderProgress = () => {
    const steps = ["confirmed", "preparing", "ready", "picked_up", "out_for_delivery", "delivered"];
    const currentIndex = steps.indexOf(order.status);
    return steps.map((step, index) => ({
      step,
      completed: index <= currentIndex,
      active: index === currentIndex,
    }));
  };

  return (
    <div className="bg-card p-4 rounded-lg shadow-sm border border-border" data-testid={`card-order-${order.id}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-medium">{order.restaurantName}</h3>
          <p className="text-sm text-muted-foreground">
            {isHistory 
              ? `${order.createdAt.toLocaleDateString()} • Order #${order.id.slice(-6)}`
              : `Order #${order.id.slice(-6)}`
            }
          </p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
          <StatusIcon className="inline h-3 w-3 mr-1" />
          {status.label}
        </span>
      </div>
      
      <div className="space-y-2 mb-4">
        {order.items.map((item, index) => (
          <div key={index} className="flex justify-between text-sm">
            <span>{item.quantity}x {item.name}</span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        
        <div className="border-t border-border pt-2 mt-2">
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span data-testid={`text-total-${order.id}`}>${order.totalAmount.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
          <div className="flex items-center gap-1">
            {order.paymentMethod === "cash" ? (
              <Banknote className="h-4 w-4" />
            ) : (
              <CreditCard className="h-4 w-4" />
            )}
            <span className="capitalize">{order.paymentMethod.replace("_", " ")}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{order.customerAddress}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Phone className="h-4 w-4" />
            <span>{order.customerPhone}</span>
          </div>
        </div>
      </div>

      {!isHistory && order.status !== "delivered" && order.status !== "cancelled" && (
        <>
          {/* Order Progress */}
          <div className="space-y-2 mb-4">
            {getOrderProgress().map(({ step, completed, active }) => (
              <div key={step} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  completed ? "bg-green-500" : active ? "bg-accent animate-pulse" : "bg-muted"
                }`} />
                <span className={`text-sm ${active ? "font-medium" : ""} ${
                  completed ? "text-foreground" : "text-muted-foreground"
                }`}>
                  {step.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>
            ))}
          </div>
          
          {order.status === "out_for_delivery" && (
            <Button className="w-full" data-testid="button-track-driver">
              Track Driver
            </Button>
          )}
        </>
      )}

      {isHistory && (
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleReorder}
            data-testid="button-reorder"
          >
            Reorder
          </Button>
          <Button variant="outline" className="flex-1" data-testid="button-rate">
            Rate Order
          </Button>
        </div>
      )}
    </div>
  );
}

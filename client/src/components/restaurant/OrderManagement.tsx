import React from "react";
import { Restaurant, Order } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { updateOrder } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";
import { Phone, MapPin, CreditCard, Banknote, Clock, X } from "lucide-react";

interface OrderManagementProps {
  restaurant: Restaurant;
  orders: Order[];
}

export default function OrderManagement({ restaurant, orders }: OrderManagementProps) {
  const { toast } = useToast();

  const newOrders = orders.filter(order => order.status === "pending");
  const ordersInProgress = orders.filter(order => 
    ["confirmed", "preparing", "ready"].includes(order.status)
  );

  const handleAcceptOrder = async (orderId: string) => {
    try {
      await updateOrder(orderId, { status: "confirmed" });
      toast({
        title: "Order accepted",
        description: "Order has been confirmed and is being prepared",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept order",
        variant: "destructive",
      });
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    try {
      await updateOrder(orderId, { status: "cancelled" });
      toast({
        title: "Order rejected",
        description: "Order has been cancelled",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject order",
        variant: "destructive",
      });
    }
  };

  const handleMarkReady = async (orderId: string) => {
    try {
      await updateOrder(orderId, { status: "ready" });
      toast({
        title: "Order ready",
        description: "Order is ready for pickup",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const getOrderBorderColor = (status: Order["status"]) => {
    switch (status) {
      case "pending": return "border-l-primary";
      case "confirmed":
      case "preparing": return "border-l-accent";
      case "ready": return "border-l-green-600";
      default: return "border-l-muted";
    }
  };

  const getStatusBadge = (status: Order["status"]) => {
    const statusConfig = {
      pending: { label: "New", color: "bg-primary/20 text-primary" },
      confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-800" },
      preparing: { label: "Preparing", color: "bg-accent/20 text-accent-foreground" },
      ready: { label: "Ready", color: "bg-green-100 text-green-800" },
    };

    const config = statusConfig[status] || { label: status, color: "bg-muted text-muted-foreground" };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* New Orders */}
      <section>
        <h2 className="text-xl font-semibold mb-4">New Orders</h2>
        <div className="space-y-4">
          {newOrders.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No new orders</p>
              <p className="text-sm text-muted-foreground">New orders will appear here</p>
            </div>
          ) : (
            newOrders.map(order => (
              <div key={order.id} className={`bg-card p-4 rounded-lg shadow-sm border border-border border-l-4 ${getOrderBorderColor(order.status)}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium">Order #{order.id.slice(-6)}</h3>
                    <p className="text-sm text-muted-foreground">
                      {order.customerName} • {Math.floor((Date.now() - order.createdAt.getTime()) / 60000)} mins ago
                    </p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(order.status)}
                    <p className="text-sm font-medium mt-1">${order.totalAmount.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.name}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  
                  <div className="border-t border-border pt-2 mt-2">
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-1">
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
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span className="font-medium">Address:</span> {order.customerAddress}
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        <span className="font-medium">Phone:</span> {order.customerPhone}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    onClick={() => handleRejectOrder(order.id)}
                    data-testid={`button-reject-${order.id}`}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => handleAcceptOrder(order.id)}
                    data-testid={`button-accept-${order.id}`}
                  >
                    Accept & Start Preparing
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Orders in Progress */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Orders in Progress</h2>
        <div className="space-y-4">
          {ordersInProgress.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No orders in progress</p>
              <p className="text-sm text-muted-foreground">Accepted orders will appear here</p>
            </div>
          ) : (
            ordersInProgress.map(order => (
              <div key={order.id} className={`bg-card p-4 rounded-lg shadow-sm border border-border border-l-4 ${getOrderBorderColor(order.status)}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium">Order #{order.id.slice(-6)}</h3>
                    <p className="text-sm text-muted-foreground">
                      {order.customerName} • {Math.floor((Date.now() - order.createdAt.getTime()) / 60000)} mins ago
                    </p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(order.status)}
                    <p className="text-sm font-medium mt-1">${order.totalAmount.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.name}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {order.status === "preparing" && (
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => handleMarkReady(order.id)}
                    data-testid={`button-mark-ready-${order.id}`}
                  >
                    Mark as Ready for Pickup
                  </Button>
                )}

                {order.status === "ready" && (
                  <div className="text-center">
                    <p className="text-sm text-green-600 font-medium">Waiting for driver pickup</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

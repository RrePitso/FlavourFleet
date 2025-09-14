import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import DeliveryCard from "@/components/driver/DeliveryCard";
import { getAvailableOrders, getOrdersByDriver, assignDriverToOrder, updateUser } from "@/lib/firestore";
import { Order } from "@shared/schema";
import { Truck, DollarSign, Star } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function DriverDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(user?.isOnline || false);
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const available = await getAvailableOrders();
        setAvailableOrders(available);
        
        if (user) {
          const active = await getOrdersByDriver(user.id);
          setActiveOrders(active);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleOnlineStatusChange = async (online: boolean) => {
    if (!user) return;
    
    try {
      await updateUser(user.id, { isOnline: online });
      setIsOnline(online);
      toast({
        title: online ? "You're now online" : "You're now offline",
        description: online ? "You can now receive delivery requests" : "You won't receive new delivery requests",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update online status",
        variant: "destructive",
      });
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    if (!user) return;
    
    try {
      await assignDriverToOrder(orderId, user.id);
      setAvailableOrders(prev => prev.filter(order => order.id !== orderId));
      
      // Refresh active orders
      const active = await getOrdersByDriver(user.id);
      setActiveOrders(active);
      
      toast({
        title: "Order accepted",
        description: "The order has been assigned to you",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept order",
        variant: "destructive",
      });
    }
  };

  // Mock stats - in real app, calculate from completed orders
  const todayStats = {
    deliveries: 8,
    earnings: 124.50,
    rating: 4.8,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading deliveries...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        title="LocalEats Driver"
        rightContent={
          <div className="flex items-center gap-2">
            <Label htmlFor="online-status" className="text-sm text-muted-foreground">
              {isOnline ? "Online" : "Offline"}
            </Label>
            <Switch
              id="online-status"
              checked={isOnline}
              onCheckedChange={handleOnlineStatusChange}
              data-testid="switch-online"
            />
          </div>
        }
      />
      
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Driver Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-card p-4 rounded-lg shadow-sm border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Truck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today's Deliveries</p>
                <p className="text-xl font-semibold" data-testid="text-deliveries">{todayStats.deliveries}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card p-4 rounded-lg shadow-sm border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-full">
                <DollarSign className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today's Earnings</p>
                <p className="text-xl font-semibold" data-testid="text-earnings">${todayStats.earnings}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card p-4 rounded-lg shadow-sm border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <Star className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Rating</p>
                <p className="text-xl font-semibold" data-testid="text-rating">{todayStats.rating}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Available Deliveries */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Available Deliveries</h2>
          
          {!isOnline && (
            <div className="bg-muted p-4 rounded-lg mb-4">
              <p className="text-muted-foreground text-sm">
                Turn on online status to see available deliveries
              </p>
            </div>
          )}
          
          <div className="space-y-4">
            {isOnline && availableOrders.length === 0 && (
              <div className="text-center py-12">
                <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No available deliveries</p>
                <p className="text-sm text-muted-foreground">New delivery requests will appear here</p>
              </div>
            )}
            
            {isOnline && availableOrders.map(order => (
              <DeliveryCard
                key={order.id}
                order={order}
                onAccept={() => handleAcceptOrder(order.id)}
                type="available"
              />
            ))}
          </div>
        </section>

        {/* Active Deliveries */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Active Deliveries</h2>
          
          <div className="space-y-4">
            {activeOrders.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No active deliveries</p>
                <p className="text-sm text-muted-foreground">Accepted deliveries will appear here</p>
              </div>
            )}
            
            {activeOrders.map(order => (
              <DeliveryCard
                key={order.id}
                order={order}
                type="active"
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

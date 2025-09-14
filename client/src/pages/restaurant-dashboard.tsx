import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import MobileNav from "@/components/layout/MobileNav";
import OrderManagement from "@/components/restaurant/OrderManagement";
import MenuManagement from "@/components/restaurant/MenuManagement";
import { getRestaurantByOwnerId, subscribeToOrders } from "@/lib/firestore";
import { Restaurant, Order } from "@shared/schema";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Clock, Flame, CheckCircle, DollarSign, TrendingUp, Star, ShoppingCart } from "lucide-react";

export default function RestaurantDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("orders");
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!user) return;
      
      try {
        const restaurantData = await getRestaurantByOwnerId(user.id);
        setRestaurant(restaurantData);
      } catch (error) {
        console.error("Error fetching restaurant:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [user]);

  useEffect(() => {
    if (!restaurant) return;

    const unsubscribe = subscribeToOrders((ordersData) => {
      setOrders(ordersData);
    }, { restaurantId: restaurant.id });

    return unsubscribe;
  }, [restaurant]);

  const mobileNavItems = [
    { id: "orders", label: "Orders", icon: "receipt", active: activeTab === "orders" },
    { id: "menu", label: "Menu", icon: "utensils", active: activeTab === "menu" },
    { id: "analytics", label: "Analytics", icon: "chart-bar", active: activeTab === "analytics" },
  ];

  // Calculate order stats
  const pendingOrders = orders.filter(order => order.status === "pending").length;
  const preparingOrders = orders.filter(order => order.status === "preparing").length;
  const readyOrders = orders.filter(order => order.status === "ready").length;
  const todayRevenue = orders
    .filter(order => {
      const today = new Date();
      const orderDate = new Date(order.createdAt);
      return orderDate.toDateString() === today.toDateString();
    })
    .reduce((total, order) => total + order.totalAmount, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading restaurant data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-muted-foreground">Restaurant not found</p>
            <p className="text-sm text-muted-foreground">Please contact support if this is an error</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        title={`${restaurant.name} Dashboard`}
        rightContent={
          <div className="flex items-center gap-2">
            <Label htmlFor="restaurant-status" className="text-sm text-muted-foreground">
              {restaurant.isOpen ? "Open" : "Closed"}
            </Label>
            <Switch
              id="restaurant-status"
              checked={restaurant.isOpen}
              data-testid="switch-restaurant-status"
            />
          </div>
        }
      />
      
      {/* Desktop Navigation */}
      <div className="hidden md:block border-b border-border">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 border-b-2 font-medium ${
                activeTab === 'orders' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              data-testid="tab-orders"
            >
              Orders
            </button>
            <button
              onClick={() => setActiveTab('menu')}
              className={`px-4 py-2 border-b-2 font-medium ${
                activeTab === 'menu' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              data-testid="tab-menu"
            >
              Menu Management
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 border-b-2 font-medium ${
                activeTab === 'analytics' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              data-testid="tab-analytics"
            >
              Analytics
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-6 pb-20 md:pb-6">
        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            {/* Order Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-card p-4 rounded-lg shadow-sm border border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-xl font-semibold" data-testid="text-pending-orders">{pendingOrders}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-card p-4 rounded-lg shadow-sm border border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-full">
                    <Flame className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Preparing</p>
                    <p className="text-xl font-semibold" data-testid="text-preparing-orders">{preparingOrders}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-card p-4 rounded-lg shadow-sm border border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ready</p>
                    <p className="text-xl font-semibold" data-testid="text-ready-orders">{readyOrders}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-card p-4 rounded-lg shadow-sm border border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Today's Revenue</p>
                    <p className="text-xl font-semibold" data-testid="text-revenue">${todayRevenue.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>

            <OrderManagement restaurant={restaurant} orders={orders} />
          </div>
        )}

        {/* Menu Tab */}
        {activeTab === "menu" && (
          <MenuManagement restaurant={restaurant} />
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Analytics & Reports</h2>
            
            {/* Revenue Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card p-4 rounded-lg shadow-sm border border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Today's Revenue</p>
                    <p className="text-xl font-semibold">${todayRevenue.toFixed(2)}</p>
                    <p className="text-xs text-green-600">↗ +15% from yesterday</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-card p-4 rounded-lg shadow-sm border border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <ShoppingCart className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Orders Today</p>
                    <p className="text-xl font-semibold">{orders.length}</p>
                    <p className="text-xs text-blue-600">↗ +12% from yesterday</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-card p-4 rounded-lg shadow-sm border border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-full">
                    <TrendingUp className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Average Order</p>
                    <p className="text-xl font-semibold">
                      ${orders.length > 0 ? (todayRevenue / orders.length).toFixed(2) : '0.00'}
                    </p>
                    <p className="text-xs text-accent">↗ +3% from yesterday</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-card p-4 rounded-lg shadow-sm border border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Star className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Rating</p>
                    <p className="text-xl font-semibold">{restaurant.rating.toFixed(1)}</p>
                    <p className="text-xs text-purple-600">↗ +0.2 this week</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Popular Items */}
            <div className="bg-card p-4 rounded-lg shadow-sm border border-border">
              <h3 className="font-medium text-lg mb-4">Most Popular Items</h3>
              <div className="space-y-3">
                {restaurant.menuItems.slice(0, 3).map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">Popular item</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${item.price.toFixed(2)}</p>
                      <div className="w-20 bg-muted rounded-full h-2 mt-1">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${85 - (index * 25)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <MobileNav 
        items={mobileNavItems}
        onItemClick={setActiveTab}
      />
    </div>
  );
}

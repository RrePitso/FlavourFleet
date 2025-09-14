import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import Navbar from "@/components/layout/Navbar";
import MobileNav from "@/components/layout/MobileNav";
import RestaurantCard from "@/components/customer/RestaurantCard";
import RestaurantModal from "@/components/customer/RestaurantModal";
import OrderCard from "@/components/customer/OrderCard";
import { getRestaurants, getOrdersByCustomer, subscribeToOrders } from "@/lib/firestore";
import { Restaurant, Order } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart } from "lucide-react";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { getItemCount } = useCart();
  const [activeTab, setActiveTab] = useState("browse");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const restaurantsData = await getRestaurants();
        setRestaurants(restaurantsData);
        
        if (user) {
          const ordersData = await getOrdersByCustomer(user.id);
          setOrders(ordersData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToOrders((ordersData) => {
      setOrders(ordersData);
    }, { customerId: user.id });

    return unsubscribe;
  }, [user]);

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    restaurant.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentOrders = orders.filter(order => 
    !["delivered", "cancelled"].includes(order.status)
  );

  const orderHistory = orders.filter(order => 
    ["delivered", "cancelled"].includes(order.status)
  );

  const mobileNavItems = [
    { id: "browse", label: "Browse", icon: "home", active: activeTab === "browse" },
    { id: "orders", label: "Orders", icon: "receipt", active: activeTab === "orders" },
    { id: "history", label: "History", icon: "history", active: activeTab === "history" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading restaurants...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar cartItemCount={getItemCount()} />
      
      <main className="max-w-6xl mx-auto px-4 py-6 pb-20 md:pb-6">
        {/* Browse Tab */}
        {activeTab === "browse" && (
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="bg-card p-4 rounded-lg shadow-sm border border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search restaurants or dishes..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search"
                />
              </div>
            </div>

            {/* Restaurants */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Popular Restaurants</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRestaurants.map(restaurant => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    onClick={() => setSelectedRestaurant(restaurant)}
                  />
                ))}
              </div>
              
              {filteredRestaurants.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No restaurants found matching your search.</p>
                </div>
              )}
            </section>
          </div>
        )}

        {/* Current Orders Tab */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Current Orders</h2>
            
            {currentOrders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No active orders</p>
                <p className="text-sm text-muted-foreground">Your current orders will appear here</p>
              </div>
            ) : (
              currentOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))
            )}
          </div>
        )}

        {/* Order History Tab */}
        {activeTab === "history" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Order History</h2>
            
            {orderHistory.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No order history</p>
                <p className="text-sm text-muted-foreground">Your completed orders will appear here</p>
              </div>
            ) : (
              orderHistory.map(order => (
                <OrderCard key={order.id} order={order} isHistory />
              ))
            )}
          </div>
        )}
      </main>

      <MobileNav 
        items={mobileNavItems}
        onItemClick={setActiveTab}
      />

      {selectedRestaurant && (
        <RestaurantModal
          restaurant={selectedRestaurant}
          onClose={() => setSelectedRestaurant(null)}
        />
      )}
    </div>
  );
}

import React from "react";
import { Restaurant } from "@shared/schema";
import { Star, Clock } from "lucide-react";

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick: () => void;
}

export default function RestaurantCard({ restaurant, onClick }: RestaurantCardProps) {
  return (
    <div 
      className="bg-card rounded-lg shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
      data-testid={`card-restaurant-${restaurant.id}`}
    >
      <div className="w-full h-40 bg-gradient-to-r from-primary/10 to-accent/10 flex items-center justify-center">
        <span className="text-muted-foreground text-lg font-medium">{restaurant.name}</span>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold">{restaurant.name}</h3>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-accent fill-current" />
            <span className="text-sm text-muted-foreground">{restaurant.rating.toFixed(1)}</span>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-2">{restaurant.description}</p>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{restaurant.deliveryTime}</span>
          </div>
          {restaurant.deliveryFee === 0 ? (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
              Free delivery
            </span>
          ) : (
            <span className="text-muted-foreground">${restaurant.deliveryFee.toFixed(2)} delivery</span>
          )}
        </div>
      </div>
    </div>
  );
}

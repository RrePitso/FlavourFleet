import React from "react";
import { Home, Receipt, History, Utensils, BarChart3 } from "lucide-react";

interface MobileNavItem {
  id: string;
  label: string;
  icon: string;
  active: boolean;
}

interface MobileNavProps {
  items: MobileNavItem[];
  onItemClick: (itemId: string) => void;
}

const iconMap = {
  home: Home,
  receipt: Receipt,
  history: History,
  utensils: Utensils,
  "chart-bar": BarChart3,
};

export default function MobileNav({ items, onItemClick }: MobileNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 md:hidden">
      <div className="flex items-center justify-around py-2">
        {items.map(item => {
          const IconComponent = iconMap[item.icon as keyof typeof iconMap] || Home;
          
          return (
            <button
              key={item.id}
              onClick={() => onItemClick(item.id)}
              className="flex-1 py-2 px-3 text-center"
              data-testid={`nav-${item.id}`}
            >
              <IconComponent className={`block mb-1 h-5 w-5 mx-auto ${
                item.active ? 'text-primary' : 'text-muted-foreground'
              }`} />
              <span className={`text-xs ${
                item.active ? 'text-primary font-medium' : 'text-muted-foreground'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

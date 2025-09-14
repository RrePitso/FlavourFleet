import { z } from "zod";

// User schema
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(["customer", "driver", "restaurant"]),
  phone: z.string().optional(),
  address: z.string().optional(),
  isOnline: z.boolean().default(false), // for drivers
  restaurantId: z.string().optional(), // for restaurant owners
});

export const insertUserSchema = userSchema.omit({ id: true });
export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Restaurant schema
export const menuItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  category: z.string(),
  available: z.boolean().default(true),
  imageUrl: z.string().optional(),
});

export const restaurantSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  address: z.string(),
  phone: z.string(),
  imageUrl: z.string().optional(),
  rating: z.number().default(0),
  deliveryTime: z.string(),
  deliveryFee: z.number().default(0),
  isOpen: z.boolean().default(true),
  menuItems: z.array(menuItemSchema),
  ownerId: z.string(),
});

export const insertRestaurantSchema = restaurantSchema.omit({ id: true });
export const insertMenuItemSchema = menuItemSchema.omit({ id: true });

export type Restaurant = z.infer<typeof restaurantSchema>;
export type MenuItem = z.infer<typeof menuItemSchema>;
export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;

// Order schema
export const orderItemSchema = z.object({
  menuItemId: z.string(),
  name: z.string(),
  price: z.number(),
  quantity: z.number(),
});

export const orderSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  customerName: z.string(),
  customerPhone: z.string(),
  customerAddress: z.string(),
  restaurantId: z.string(),
  restaurantName: z.string(),
  driverId: z.string().optional(),
  items: z.array(orderItemSchema),
  totalAmount: z.number(),
  paymentMethod: z.enum(["cash", "bank_transfer"]),
  status: z.enum([
    "pending",
    "confirmed", 
    "preparing",
    "ready",
    "picked_up",
    "out_for_delivery",
    "delivered",
    "cancelled"
  ]).default("pending"),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertOrderSchema = orderSchema.omit({ id: true, createdAt: true, updatedAt: true });

export type Order = z.infer<typeof orderSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

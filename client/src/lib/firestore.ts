import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { User, Restaurant, Order, InsertUser, InsertRestaurant, InsertOrder, MenuItem } from "@shared/schema";

// Users
export const createUser = async (uid: string, userData: InsertUser): Promise<void> => {
  await updateDoc(doc(db, "users", uid), userData);
};

export const getUserById = async (uid: string): Promise<User | null> => {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as User;
  }
  return null;
};

export const updateUser = async (uid: string, updates: Partial<User>): Promise<void> => {
  await updateDoc(doc(db, "users", uid), updates);
};

// Restaurants
export const createRestaurant = async (restaurantData: InsertRestaurant): Promise<string> => {
  const docRef = await addDoc(collection(db, "restaurants"), restaurantData);
  return docRef.id;
};

export const getRestaurants = async (): Promise<Restaurant[]> => {
  const querySnapshot = await getDocs(collection(db, "restaurants"));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Restaurant));
};

export const getRestaurantById = async (id: string): Promise<Restaurant | null> => {
  const docRef = doc(db, "restaurants", id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Restaurant;
  }
  return null;
};

export const getRestaurantByOwnerId = async (ownerId: string): Promise<Restaurant | null> => {
  const q = query(collection(db, "restaurants"), where("ownerId", "==", ownerId));
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Restaurant;
  }
  return null;
};

export const updateRestaurant = async (id: string, updates: Partial<Restaurant>): Promise<void> => {
  await updateDoc(doc(db, "restaurants", id), updates);
};

export const updateMenuItem = async (restaurantId: string, menuItems: MenuItem[]): Promise<void> => {
  await updateDoc(doc(db, "restaurants", restaurantId), { menuItems });
};

// Orders
export const createOrder = async (orderData: InsertOrder): Promise<string> => {
  const docRef = await addDoc(collection(db, "orders"), {
    ...orderData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getOrdersByCustomer = async (customerId: string): Promise<Order[]> => {
  const q = query(
    collection(db, "orders"),
    where("customerId", "==", customerId),
    orderBy("createdAt", "desc")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date(),
  } as Order));
};

export const getOrdersByRestaurant = async (restaurantId: string): Promise<Order[]> => {
  const q = query(
    collection(db, "orders"),
    where("restaurantId", "==", restaurantId),
    orderBy("createdAt", "desc")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date(),
  } as Order));
};

export const getAvailableOrders = async (): Promise<Order[]> => {
  const q = query(
    collection(db, "orders"),
    where("status", "==", "ready"),
    where("driverId", "==", null),
    orderBy("createdAt", "asc")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date(),
  } as Order));
};

export const getOrdersByDriver = async (driverId: string): Promise<Order[]> => {
  const q = query(
    collection(db, "orders"),
    where("driverId", "==", driverId),
    where("status", "in", ["picked_up", "out_for_delivery"]),
    orderBy("createdAt", "desc")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date(),
  } as Order));
};

export const updateOrder = async (id: string, updates: Partial<Order>): Promise<void> => {
  await updateDoc(doc(db, "orders", id), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const assignDriverToOrder = async (orderId: string, driverId: string): Promise<void> => {
  await updateDoc(doc(db, "orders", orderId), {
    driverId,
    status: "picked_up",
    updatedAt: serverTimestamp(),
  });
};

// Real-time subscriptions
export const subscribeToOrders = (
  callback: (orders: Order[]) => void,
  filters?: { customerId?: string; restaurantId?: string; driverId?: string }
) => {
  let q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  
  if (filters?.customerId) {
    q = query(q, where("customerId", "==", filters.customerId));
  }
  if (filters?.restaurantId) {
    q = query(q, where("restaurantId", "==", filters.restaurantId));
  }
  if (filters?.driverId) {
    q = query(q, where("driverId", "==", filters.driverId));
  }
  
  return onSnapshot(q, (querySnapshot) => {
    const orders = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    } as Order));
    callback(orders);
  });
};

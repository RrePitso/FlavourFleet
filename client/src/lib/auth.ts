import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  User as FirebaseUser 
} from "firebase/auth";
import { auth } from "./firebase";
import { createUser, getUserById } from "./firestore";
import { InsertUser, User } from "@shared/schema";

export const signUp = async (email: string, password: string, userData: Omit<InsertUser, 'email'>) => {
  const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
  
  const newUser: InsertUser = {
    email,
    ...userData,
  };
  
  await createUser(firebaseUser.uid, newUser);
  return firebaseUser;
};

export const signIn = async (email: string, password: string) => {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
};

export const signOut = () => firebaseSignOut(auth);

export const getCurrentUser = async (firebaseUser: FirebaseUser): Promise<User | null> => {
  if (!firebaseUser) return null;
  return await getUserById(firebaseUser.uid);
};

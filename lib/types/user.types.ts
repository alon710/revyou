import { Timestamp } from "firebase/firestore";

export interface UserCreate {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  stripeId?: string;
  stripeLink?: string;
}

export interface User extends UserCreate {
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface UserUpdate {
  displayName?: string;
  photoURL?: string;
}

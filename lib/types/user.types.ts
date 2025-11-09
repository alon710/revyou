import {
  Timestamp,
  WithFieldValue,
  PartialWithFieldValue,
} from "firebase/firestore";

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
  updatedAt?: Timestamp;
}

// Write-time types that accept FieldValue sentinels for timestamp fields
export type UserCreateInput = WithFieldValue<UserCreate>;
export type UserUpdateInput = PartialWithFieldValue<UserUpdate>;

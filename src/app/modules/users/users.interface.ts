export enum Role {
  ADMIN = "ADMIN",
  TOURIST = "TOURIST",
  GUIDE = "GUIDE",
}

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
}

export interface IUser {
  // Common Fields
  name: string;
  email: string;
  password: string;
  role: Role;

  profilePicture?: string;
  bio?: string;
  languages: string[];

  // Guide Fields
  expertise?: string[];
  dailyRate?: number;
  city?: string; // 🆕 ADD THIS - Crucial for guides

  // Tourist Fields
  travelPreferences?: string[];

  // System Fields
  isVerified: boolean;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  // Instance Methods
  matchPassword?(enteredPassword: string): Promise<boolean>;
}

// For registration payload (without _id and timestamps)
export interface IUserCreate {
  name: string;
  email: string;
  password: string;
  role: Role;
  profilePicture?: string;
  bio?: string;
  languages?: string[];
  expertise?: string[];
  dailyRate?: number;
  city?: string; // 🆕 ADD THIS
  travelPreferences?: string[];
}

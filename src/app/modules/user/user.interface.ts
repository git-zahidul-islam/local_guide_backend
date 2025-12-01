export type IUserFilterRequest = {
  searchTerm?: string;
  role?: string;
  city?: string;
};

export type IUpdateProfile = {
  name?: string;
  bio?: string;
  profilePic?: string;
  languages?: string[];
  expertise?: string[];
  dailyRate?: number;
  travelPreferences?: string[];
};
export type IAdminStats = {
  totalUsers: number;
  totalGuides: number;
  totalTourists: number;
  totalListings: number;
  totalBookings: number;
  totalRevenue: number;
  recentBookings: any[];
  topGuides: any[];
};

export type IUpdateUserStatus = {
  isVerified?: boolean;
  role?: string;
};
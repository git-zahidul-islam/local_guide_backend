export type ICreateBooking = {
  listingId: string;
  requestedDate: string;
  totalAmount: number;
};

export type IUpdateBookingStatus = {
  status: 'CONFIRMED' | 'CANCELLED';
};

export type IBookingFilterRequest = {
  status?: string;
  touristId?: string;
  guideId?: string;
};
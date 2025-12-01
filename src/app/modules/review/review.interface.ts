export type ICreateReview = {
  bookingId: string;
  rating: number;
  comment?: string;
};

export type IReviewFilterRequest = {
  revieweeId?: string;
  rating?: number;
};
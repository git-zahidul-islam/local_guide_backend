export type ICreatePaymentIntent = {
  bookingId: string;
  amount: number;
  currency?: string;
};

export type IConfirmPayment = {
  sessionId: string;
};

export type IPaymentStatus = {
  sessionId: string;
};
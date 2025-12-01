export type ICreatePaymentIntent = {
  bookingId: string;
  amount: number;
  currency?: string;
};

export type IConfirmPayment = {
  paymentIntentId: string;
  bookingId: string;
};
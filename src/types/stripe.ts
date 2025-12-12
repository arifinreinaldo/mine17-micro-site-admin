export interface PricingPlan {
  name: string;
  description: string;
  price: number;
  priceId: string;
  features: string[];
}

export interface CheckoutSessionResponse {
  sessionId: string;
}

export interface SubscriptionResponse {
  message: string;
  subscription: any;
}

export interface StripeCheckoutPayload {
  priceId: string;
  planName?: string;
}

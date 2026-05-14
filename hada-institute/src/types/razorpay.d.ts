export {};

declare global {
  interface Window {
    Razorpay?: new (
      options: RazorpayOptions,
    ) => {
      open: () => void;
      on: (event: string, callback: (response: unknown) => void) => void;
    };
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string | null;
    email?: string | null;
    contact?: string | null;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  handler?: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

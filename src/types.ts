export type Plan = {
  id: string;
  duration: string;
  price: number;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  category?: string;
  features: string[];
  image: string;
  plans: Plan[];
};

export type OrderStatus = 'Pending' | 'Completed' | 'Failed' | 'Approved' | 'Success';
export type PaymentStatus = 'Pending' | 'Verified' | 'Rejected' | 'Success' | 'Approved';

export type Order = {
  id: string;
  user_id: string;
  product_id: string;
  product_name: string;
  plan_duration: string;
  amount: number;
  purchase_date: string;
  expiry_date: string;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  utr_number?: string;
  payment_date?: string;
  payment_time?: string;
  payment_screenshot_url?: string;
  customer_name?: string;
  customer_email?: string;
  product_key?: string;
};

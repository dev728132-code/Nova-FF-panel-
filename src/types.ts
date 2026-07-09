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

export type ProfileRole = 'user' | 'reseller' | 'admin';
export type ProfileStatus = 'active' | 'banned' | 'suspended';

export type Profile = {
  id: string;
  email?: string;
  full_name?: string;
  phone?: string;
  active_panels: number;
  created_at: string;
  role: ProfileRole;
  status: ProfileStatus;
  suspended_until?: string;
  last_login?: string;
};

export type LoginHistory = {
  id: string;
  user_id: string;
  login_time: string;
  ip_address?: string;
  device?: string;
  browser?: string;
  location?: string;
  profiles?: {
    email: string;
    full_name: string;
  };
};

export type ResellerPrice = {
  id: string;
  reseller_id: string;
  plan_id: string;
  price: number;
  plans?: Plan;
};

export type PromoCode = {
  id: string;
  code: string;
  discount_percentage?: number;
  fixed_discount?: number;
  expiry_date?: string;
  usage_limit?: number;
  times_used: number;
  is_active: boolean;
  created_at: string;
};

export type AdminNotification = {
  id: string;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

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

export interface MembershipPlan {
  id: number;
  name: string;
  fee_monthly: number;
  active?: boolean;
}

export interface PublicConfig {
  name: string;
  address: string;
  phone: string;
  terms: string;
  timings: string[];
  facilities: string[];
  plans: MembershipPlan[];
}

export interface RegistrationResult {
  registration_no: string;
  download_token: string;
  status: string;
  payment_mode: "Cash" | "Online";
  amount_due: number;
}

export interface RegistrationRow {
  registration_no: string;
  full_name: string;
  mobile: string;
  exam_category: string;
  status: string;
  payment_status: string;
  payment_mode: "Cash" | "Online";
  amount_due: number;
  membership_status: string;
  download_token: string;
}

export interface DashboardSummary {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  active: number;
}

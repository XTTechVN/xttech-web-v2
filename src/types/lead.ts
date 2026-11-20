export type LeadSource =
  | 'hero_software_register'
  | 'hero_consultation'
  | 'hero_demo_modal'
  | 'news_software_register';

export interface PublicLeadRegistrationRequest {
  source: LeadSource;
  fullName: string;
  phone: string;
  email?: string | null;
  companyName?: string | null;
  taxCode?: string | null;
  region?: string | null;
  jobTitle?: string | null;
  interestLevel?: string | null;
  note?: string | null;
  pageUrl?: string | null;
}

export interface PublicLeadRegistrationResponse {
  accepted: boolean;
  message: string;
  source: LeadSource;
  submittedAt: string;
}

export interface RegisterFormState {
  fullName: string;
  phone: string;
  email: string;
  companyName: string;
  taxCode: string;
  note: string;
}

export type RegisterFormErrors = Partial<Record<keyof RegisterFormState, string>>;

export interface CountdownSnapshot {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  progress: number;
}

export interface RegisterInlineFormProps {
  onBack: () => void;
  variant?: 'inline' | 'modal';
  isOpen?: boolean;
  onSuccess?: () => void;
}

export type HeroRegisterInlineFormProps = RegisterInlineFormProps;

export const INITIAL_REGISTER_FORM: RegisterFormState = {
  fullName: '',
  phone: '',
  email: '',
  companyName: '',
  taxCode: '',
  note: '',
};

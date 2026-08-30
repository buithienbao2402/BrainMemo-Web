// Payload theo mục 2. Auth & Session của API_Contract.md

export interface RegisterRequestOtpPayload {
  email: string;
  password: string;
  fullName: string;
}

export interface RegisterVerifyPayload {
  email: string;
  otp: string;
}
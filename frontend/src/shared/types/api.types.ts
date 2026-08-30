/**
 * Envelope chuẩn cho mọi response từ backend — xem API_Contract.md mục 0.
 */
export interface ApiFieldError {
  field: string;
  code: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: ApiFieldError[] | null;
}
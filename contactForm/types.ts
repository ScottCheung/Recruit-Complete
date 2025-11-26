/** @format */

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export interface ContactFormConfig {
  apiUrl?: string; // API route URL (e.g., '/api/contact')
  googleAppsScriptUrl?: string; // Legacy: Google Apps Script URL (deprecated)
  sharedSecret?: string; // Legacy: Shared secret for Google Apps Script (deprecated)
  autoResetDelay?: number; // Delay time (milliseconds) to auto-reset form after success
  // The following are optional record fields, will be written to the sheet if provided
  contactType?: string; // User/Merchant
  category?: string; // Inquiry category
  assignedTo?: string; // Assigned person
  status?: string; // New / In Progress / Replied / Closed
  internalTag?: string; // Internal tag
  followUpDate?: string; // Follow-up date (YYYY/MM/DD)
}

export interface ContactFormProps {
  config: ContactFormConfig;
  className?: string;
  title?: string;
  description?: string;
  onSuccess?: (data: ContactFormData) => void;
  onError?: (error: string) => void;
  variant?: 'default' | 'compact' | 'inline';
  showAnimation?: boolean;
}

export type SubmitStatus = 'idle' | 'success' | 'error';

export interface ContactFormResponse {
  success: boolean;
  message?: string;
  error?: string;
  timestamp?: string;
  debug?: {
    sheetId?: string;
    requestedSheetName?: string;
    availableSheets?: string[];
  };
}

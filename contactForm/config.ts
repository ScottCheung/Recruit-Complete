/** @format */

import { ContactFormConfig } from './types';

/**
 * Default configuration
 * Supports both Google Sheet storage and email notifications
 */
export const DEFAULT_CONFIG: ContactFormConfig = {
  // Google Apps Script URL for storing data to Google Sheet
  googleAppsScriptUrl:
    'https://script.google.com/macros/s/AKfycbw1ZeMoiAMaqpZngmK3eFa5ovqCQW0Mt7ZxfAtDH9qthFzrC_qUmkRNRLurefzwCGRk/exec',
  sharedSecret: '7a8b9c0d-1e2f-3g4h-5i6j-7k8l9m0n1o2p',
  // Next.js API route for sending email notifications
  apiUrl: '/api/contact',
  // Auto-reset state after 3 seconds on success
  autoResetDelay: 3000,
};

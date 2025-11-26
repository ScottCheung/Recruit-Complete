/** @format */
'use client';
import { useState, FormEvent, ChangeEvent } from 'react';
import { ContactFormData, ContactFormConfig, SubmitStatus } from '../types';

export function useContactForm(config: ContactFormConfig) {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Handle input changes
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({ name: '', email: '', message: '' });
    setSubmitStatus('idle');
    setErrorMessage('');
  };

  // Submit form
  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>,
    callbacks?: {
      onSuccess?: (data: ContactFormData) => void;
      onError?: (error: string) => void;
    },
  ) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      // Collect all fields from current form
      const formEl = e.currentTarget as HTMLFormElement;
      const formDataToSend = new FormData(formEl);

      // Prepare promises for parallel execution
      const promises: Promise<Response>[] = [];
      const requestTypes: string[] = [];

      // 1. Submit to Google Apps Script (for Google Sheet storage)
      if (config.googleAppsScriptUrl) {
        // Add secret to form data for Google Apps Script
        if (config.sharedSecret) {
          formDataToSend.append('secret', config.sharedSecret);
        }
        // Add metadata fields that Google Apps Script expects
        formDataToSend.append('source', window.location.href);
        formDataToSend.append('sourcePath', window.location.pathname);
        formDataToSend.append('ua', navigator.userAgent);

        const googleSheetPromise = fetch(config.googleAppsScriptUrl, {
          method: 'POST',
          body: formDataToSend,
        });
        promises.push(googleSheetPromise);
        requestTypes.push('Google Sheet');
        console.log(
          '📊 Submitting to Google Sheet...',
          config.googleAppsScriptUrl,
        );
      }

      // 2. Submit to email API (for email notifications)
      if (config.apiUrl) {
        // Create a new FormData for email API (clone the original)
        const emailFormData = new FormData();
        formDataToSend.forEach((value, key) => {
          emailFormData.append(key, value);
        });

        // Log form data being sent
        console.log('📧 Sending email notifications...', config.apiUrl);
        console.log('📧 Form data:', {
          name: emailFormData.get('name'),
          email: emailFormData.get('email'),
          message: emailFormData.get('message'),
          category: emailFormData.get('category'),
        });

        const emailPromise = fetch(config.apiUrl, {
          method: 'POST',
          body: emailFormData,
        });
        promises.push(emailPromise);
        requestTypes.push('Email API');
      } else {
        console.warn('⚠️ Email API URL not configured!');
      }

      // If neither is configured, use fallback
      if (promises.length === 0) {
        const fallbackUrl = config.apiUrl || '/api/contact';
        promises.push(
          fetch(fallbackUrl, {
            method: 'POST',
            body: formDataToSend,
          }),
        );
      }

      // Execute all requests in parallel
      const responses = await Promise.allSettled(promises);

      // Process responses
      let hasSuccess = false;
      let lastError: string | null = null;
      const results: Array<{ type: string; success: boolean; error?: string }> =
        [];

      for (let i = 0; i < responses.length; i++) {
        const result = responses[i];
        const requestType = requestTypes[i] || `Request ${i + 1}`;

        if (result.status === 'fulfilled') {
          const response = result.value;

          if (response.ok) {
            // Try to parse JSON response
            try {
              const jsonData = await response.json();
              if (jsonData.success) {
                hasSuccess = true;
                console.log(`✅ ${requestType} succeeded:`, jsonData);
                results.push({ type: requestType, success: true });
              } else {
                console.warn(
                  `⚠️ ${requestType} returned success:false:`,
                  jsonData,
                );
                results.push({
                  type: requestType,
                  success: false,
                  error: jsonData.error || 'Unknown error',
                });
                lastError = jsonData.error || `${requestType} failed`;
              }
            } catch {
              // If not JSON, that's okay (Google Apps Script might return HTML)
              // Assume success for non-JSON responses (like Google Apps Script)
              hasSuccess = true;
              console.log(`✅ ${requestType} succeeded (non-JSON response)`);
              results.push({ type: requestType, success: true });
            }
          } else {
            // Response not OK
            let errorMsg = `Status ${response.status}`;
            try {
              const errorData = await response.json();
              errorMsg = errorData.error || errorMsg;
              console.error(`❌ ${requestType} failed:`, errorData);
            } catch {
              const text = await response.text();
              errorMsg = text || errorMsg;
              console.error(
                `❌ ${requestType} failed (${response.status}):`,
                text.substring(0, 200),
              );
            }
            lastError = `${requestType}: ${errorMsg}`;
            results.push({
              type: requestType,
              success: false,
              error: errorMsg,
            });
          }
        } else {
          // Promise rejected
          const errorMsg = result.reason?.message || 'Network error';
          lastError = `${requestType}: ${errorMsg}`;
          console.error(`❌ ${requestType} error:`, result.reason);
          results.push({ type: requestType, success: false, error: errorMsg });
        }
      }

      // Log summary
      console.log('📋 Submission Summary:', results);

      // Determine success/failure
      // If at least one request succeeded, consider it a success
      // (Google Sheet storage is more critical than email)
      if (hasSuccess) {
        // At least one request succeeded
        setSubmitStatus('success');
        callbacks?.onSuccess?.(formData);

        // Clear form
        setFormData({ name: '', email: '', message: '' });

        // Show appropriate message based on results
        const failedRequests = results.filter((r) => !r.success);
        const emailSuccess = results.some(
          (r) => r.type === 'Email API' && r.success,
        );
        const googleSheetSuccess = results.some(
          (r) => r.type === 'Google Sheet' && r.success,
        );

        if (failedRequests.length > 0 && promises.length > 1) {
          const failedTypes = failedRequests.map((r) => r.type).join(', ');
          console.warn(
            `⚠️ Some requests failed, but at least one succeeded. Failed: ${failedTypes}`,
            failedRequests,
          );

          // Show specific messages based on what succeeded/failed
          if (emailSuccess && !googleSheetSuccess) {
            // Email succeeded but Google Sheet failed
            setErrorMessage(
              '✅ Your message has been sent successfully! However, there was an issue saving to our database. We have received your email and will respond soon.',
            );
          } else if (!emailSuccess && googleSheetSuccess) {
            // Google Sheet succeeded but email failed
            setErrorMessage(
              '✅ Your message has been received! However, email notification failed. We have your information and will contact you soon.',
            );
          } else if (emailSuccess) {
            // Email succeeded (Google Sheet may or may not have succeeded)
            // Don't show error, just log it
            console.log('✅ Email sent successfully!');
          }
        } else if (emailSuccess) {
          // All succeeded, clear any previous error messages
          setErrorMessage('');
        }

        // Auto-reset state
        if (config.autoResetDelay) {
          setTimeout(() => {
            setSubmitStatus('idle');
          }, config.autoResetDelay);
        }
      } else {
        // All requests failed
        const error = lastError || 'Submission failed. Please try again.';
        setSubmitStatus('error');
        setErrorMessage(error);
        callbacks?.onError?.(error);
      }
    } catch (error) {
      const errorMsg = 'Network error. Please try again.';
      setSubmitStatus('error');
      setErrorMessage(errorMsg);
      callbacks?.onError?.(errorMsg);
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    isSubmitting,
    submitStatus,
    errorMessage,
    handleInputChange,
    handleSubmit,
    resetForm,
  };
}

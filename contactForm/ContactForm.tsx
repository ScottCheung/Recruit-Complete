/** @format */
'use client';

import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx as cn } from 'clsx';
import { ContactFormProps } from './types';
import { useContactForm } from './hooks/useContactForm';
import Button from '../Button';

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const },
  },
} as const;

export function ContactForm({
  config,
  className,
  title = 'Get In Touch',
  description = "Have questions? We'd love to hear from you.",
  onSuccess,
  onError,
  variant = 'default',
  showAnimation = true,
}: ContactFormProps) {
  const {
    formData,
    isSubmitting,
    submitStatus,
    errorMessage,
    handleInputChange,
    handleSubmit,
  } = useContactForm(config);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    handleSubmit(e, { onSuccess, onError });
  };

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={cn('w-full max-w-md', className)}>
        <form onSubmit={onSubmit} className='space-y-3'>
          {/* hidden metadata fields from config */}
          {config.contactType && (
            <input
              type='hidden'
              name='contactType'
              value={config.contactType}
            />
          )}
          {config.category && (
            <input type='hidden' name='category' value={config.category} />
          )}
          {config.assignedTo && (
            <input type='hidden' name='assignedTo' value={config.assignedTo} />
          )}
          {config.status && (
            <input type='hidden' name='status' value={config.status} />
          )}
          {config.internalTag && (
            <input
              type='hidden'
              name='internalTag'
              value={config.internalTag}
            />
          )}
          {config.followUpDate && (
            <input
              type='hidden'
              name='followUpDate'
              value={config.followUpDate}
            />
          )}
          <input
            type='text'
            name='name'
            value={formData.name}
            onChange={handleInputChange}
            required
            disabled={isSubmitting}
            className='w-full px-4 py-2 text-sm transition-all duration-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed'
            placeholder='Your name'
          />
          <input
            type='email'
            name='email'
            value={formData.email}
            onChange={handleInputChange}
            required
            disabled={isSubmitting}
            className='w-full px-4 py-2 text-sm transition-all duration-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed'
            placeholder='your.email@example.com'
          />
          <textarea
            name='message'
            value={formData.message}
            onChange={handleInputChange}
            disabled={isSubmitting}
            rows={3}
            className='w-full px-4 py-2 text-sm transition-all duration-200 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed'
            placeholder='Your message'
          />

          {submitStatus === 'success' && (
            <div className='flex items-center px-3 py-2 space-x-2 text-sm text-green-600 rounded-lg bg-green-50'>
              <CheckCircle2 className='w-4 h-4' />
              <span>Sent successfully!</span>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className='flex flex-col px-3 py-2 space-y-2 text-sm text-red-600 rounded-lg bg-red-50'>
              <div className='flex items-center space-x-2'>
                <AlertCircle className='w-4 h-4' />
                <span>{errorMessage.split('\n')[0]}</span>
              </div>
              {errorMessage.includes('Available sheets') && (
                <div className='p-2 mt-1 text-xs text-red-700 rounded bg-red-100/50'>
                  {errorMessage.split('\n')[1]}
                </div>
              )}
            </div>
          )}

          <button
            type='submit'
            disabled={isSubmitting}
            className={cn(
              'w-full py-2 px-4 rounded-lg font-medium text-white transition-all duration-200 flex items-center justify-center space-x-2 text-sm',
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-primary-600 to-primary-800 hover:shadow-lg',
            )}
          >
            {isSubmitting ? (
              <div className='flex items-center justify-center gap-2'>
                <div className='flex w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin' />
                <span className='flex'>Sending...</span>
              </div>
            ) : (
              <div className='flex items-center justify-center gap-2'>
                <Send className='flex w-4 h-4' />
                <span className='flex'>Send</span>
              </div>
            )}
          </button>
        </form>
      </div>
    );
  }

  // Inline variant
  if (variant === 'inline') {
    return (
      <div className={cn('w-full', className)}>
        <form onSubmit={onSubmit} className='flex flex-col gap-2 sm:flex-row'>
          {/* hidden metadata fields from config */}
          {config.contactType && (
            <input
              type='hidden'
              name='contactType'
              value={config.contactType}
            />
          )}
          {config.category && (
            <input type='hidden' name='category' value={config.category} />
          )}
          {config.assignedTo && (
            <input type='hidden' name='assignedTo' value={config.assignedTo} />
          )}
          {config.status && (
            <input type='hidden' name='status' value={config.status} />
          )}
          {config.internalTag && (
            <input
              type='hidden'
              name='internalTag'
              value={config.internalTag}
            />
          )}
          {config.followUpDate && (
            <input
              type='hidden'
              name='followUpDate'
              value={config.followUpDate}
            />
          )}
          <input
            type='text'
            name='name'
            value={formData.name}
            onChange={handleInputChange}
            required
            disabled={isSubmitting}
            className='flex-1 px-4 py-2 transition-all duration-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed'
            placeholder='Name'
          />
          <input
            type='email'
            name='email'
            value={formData.email}
            onChange={handleInputChange}
            required
            disabled={isSubmitting}
            className='flex-1 px-4 py-2 transition-all duration-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed'
            placeholder='Email'
          />
          <button
            type='submit'
            disabled={isSubmitting}
            className={cn(
              'px-6 py-2 rounded-lg font-medium text-white transition-all duration-200 flex items-center justify-center space-x-2 whitespace-nowrap',
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-primary-600 to-primary-800 hover:shadow-lg',
            )}
          >
            {isSubmitting ? (
              <div className='w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin' />
            ) : (
              <>
                <Send className='w-4 h-4' />
                <span>Send</span>
              </>
            )}
          </button>
        </form>
        {submitStatus === 'success' && (
          <div className='flex items-center mt-2 space-x-2 text-sm text-green-600'>
            <CheckCircle2 className='w-4 h-4' />
            <span>Message sent successfully!</span>
          </div>
        )}
        {submitStatus === 'error' && (
          <div className='flex flex-col mt-2 space-y-2 text-sm text-red-600'>
            <div className='flex items-center space-x-2'>
              <AlertCircle className='w-4 h-4' />
              <span>{errorMessage.split('\n')[0]}</span>
            </div>
            {errorMessage.includes('可用工作表') && (
              <div className='p-2 mt-1 text-xs text-red-700 rounded bg-red-100/50'>
                {errorMessage.split('\n')[1]}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Default variant (full form)
  const formContent = (
    <div className=''>
      {(title || description) && (
        <div className='text-center mb-6 pt-[60px]'>
          {title && (
            <h3 className='mb-2 text-3xl font-bold text-gray-900'>{title}</h3>
          )}
          {description && (
            <p className='text-sm text-gray-600'>{description}</p>
          )}
        </div>
      )}

      <form onSubmit={onSubmit} className='space-y-4'>
        {/* hidden metadata fields from config */}
        {config.contactType && (
          <input type='hidden' name='contactType' value={config.contactType} />
        )}
        {config.category && (
          <input type='hidden' name='category' value={config.category} />
        )}
        {config.assignedTo && (
          <input type='hidden' name='assignedTo' value={config.assignedTo} />
        )}
        {config.status && (
          <input type='hidden' name='status' value={config.status} />
        )}
        {config.internalTag && (
          <input type='hidden' name='internalTag' value={config.internalTag} />
        )}
        {config.followUpDate && (
          <input
            type='hidden'
            name='followUpDate'
            value={config.followUpDate}
          />
        )}

        {/* Question Type */}
        <div>
          <label
            htmlFor='category'
            className='block mb-1 text-sm font-medium text-gray-700'
          >
            Question Type <span className='text-red-500'>*</span>
          </label>
          <select
            id='category'
            name='category'
            required
            disabled={isSubmitting}
            className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed'
            defaultValue=''
          >
            <option value='General Inquiry' selected>
              General Inquiry
            </option>
            <option value='Solution Consultation'>Solution Consultation</option>
            <option value='Collaboration'>Collaboration</option>
            <option value='Technical Issue'>Technical Issue</option>
            <option value='Other'>Other</option>
          </select>
        </div>
        {/* Name Input */}
        <div>
          <label
            htmlFor='name'
            className='block mb-1 text-sm font-medium text-gray-700'
          >
            Name <span className='text-red-500'>*</span>
          </label>
          <input
            type='text'
            id='name'
            name='name'
            value={formData.name}
            onChange={handleInputChange}
            required
            disabled={isSubmitting}
            className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed'
            placeholder='Your name'
          />
        </div>

        {/* Email Input */}
        <div>
          <label
            htmlFor='email'
            className='block mb-1 text-sm font-medium text-gray-700'
          >
            Email <span className='text-red-500'>*</span>
          </label>
          <input
            type='email'
            id='email'
            name='email'
            value={formData.email}
            onChange={handleInputChange}
            required
            disabled={isSubmitting}
            className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed'
            placeholder='your.email@example.com'
          />
        </div>

        {/* Message Input */}
        <div>
          <label
            htmlFor='message'
            className='block mb-1 text-sm font-medium text-gray-700'
          >
            Message
          </label>
          <textarea
            id='message'
            name='message'
            value={formData.message}
            onChange={handleInputChange}
            disabled={isSubmitting}
            rows={4}
            className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none disabled:bg-gray-100 disabled:cursor-not-allowed'
            placeholder='How can we help you?'
          />
        </div>

        {/* Status Messages */}
        {submitStatus === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className='flex items-center px-4 py-3 space-x-2 text-green-600 rounded-lg bg-green-50'
          >
            <CheckCircle2 className='w-5 h-5' />
            <span className='text-sm font-medium'>
              Message sent successfully!
            </span>
          </motion.div>
        )}

        {submitStatus === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className='flex flex-col px-4 py-3 space-y-2 text-red-600 rounded-lg bg-red-50'
          >
            <div className='flex items-center space-x-2'>
              <AlertCircle className='w-5 h-5' />
              <span className='text-sm font-medium'>
                {errorMessage.split('\n')[0]}
              </span>
            </div>
            {errorMessage.includes('可用工作表') && (
              <div className='p-2 mt-1 text-xs text-red-700 rounded bg-red-100/50'>
                {errorMessage.split('\n')[1]}
              </div>
            )}
          </motion.div>
        )}

        <Button
          type='submit'
          disabled={isSubmitting}
          variant='primary'
          target='blank'
          size='lg'
          showArrow={false}
          className='w-full'
        >
          {isSubmitting ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className='w-5 h-5 border-2 border-white rounded-full border-t-transparent'
              />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <Send className='w-5 h-5' />
              <span>Send Message</span>
            </>
          )}
        </Button>
      </form>
    </div>
  );

  if (showAnimation) {
    return (
      <motion.div
        variants={itemVariants}
        initial='hidden'
        animate='visible'
        className={cn('w-full max-w-2xl mx-auto', className)}
      >
        {formContent}
      </motion.div>
    );
  }

  return (
    <div className={cn('w-full max-w-2xl mx-auto', className)}>
      {formContent}
    </div>
  );
}

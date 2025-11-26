/**
 * Google Apps Script - Information Collection Backend
 * After deploying as Web App, frontend can directly POST form data
 *
 * @format
 */

// ========== Configuration Area ==========
const SHEET_ID = '1qncvjrgkfqdER6F8_LCQYgqLDAlxlKtbqRMLF5wcV9o'; // Replace with your Google Sheet ID
const SHEET_NAME = 'BlueSky Contact Form'; // Sheet name
const SHARED_SECRET = '7a8b9c0d-1e2f-3g4h-5i6j-7k8l9m0n1o2p'; // Frontend/backend shared secret (optional)
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  // Production
  'https://blueskycreations.com.au',
  // Staging
  'https://bluesky-silk.vercel.app/',
];

// ========== Email Configuration ==========
// Email settings - using Google Apps Script MailApp (uses Google account)
// If you need to use Office 365, you'll need to set up OAuth with Microsoft Graph API
const EMAIL_ENABLED = false; // Set to false to disable email notifications
const NOTIFICATION_EMAIL = 'info@blueskycreations.com.au'; // Email to receive notifications
const REPLY_TO_EMAIL = 'info@blueskycreations.com.au'; // Reply-to address for confirmation emails
const COMPANY_NAME = 'BlueSky Creations'; // Your company name

// ========== Main Processing Function ==========
function doPost(e) {
  try {
    // Get form data
    const params = e.parameter;

    // Validate secret (optional)
    if (SHARED_SECRET && params.secret !== SHARED_SECRET) {
      return createResponse({ success: false, error: 'Invalid secret' }, 403);
    }

    // Validate required fields
    if (!params.name || !params.email) {
      return createResponse(
        { success: false, error: 'Name and email are required' },
        400,
      );
    }

    // Open Google Sheet
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);

    if (!sheet) {
      // Get all sheet names for debugging
      const allSheets = spreadsheet.getSheets().map((s) => s.getName());
      return createResponse(
        {
          success: false,
          error: `Sheet not found: "${SHEET_NAME}"`,
          debug: {
            sheetId: SHEET_ID,
            requestedSheetName: SHEET_NAME,
            availableSheets: allSheets,
          },
        },
        500,
      );
    }

    // Calculate fields
    const createdAt = new Date();
    const createdUtc = createdAt.toISOString();
    const createdLocal = Utilities.formatDate(
      createdAt,
      'Australia/Sydney',
      'yyyy/MM/dd HH:mm',
    );

    // Generate auto-increment ID (first row is header, if no data start from 1001)
    const lastRow = sheet.getLastRow();
    let nextId = 1001;
    if (lastRow >= 2) {
      const lastIdCell = sheet.getRange(lastRow, 1).getValue();
      const parsed = parseInt(lastIdCell, 10);
      if (!isNaN(parsed)) nextId = parsed + 1;
    }

    // Parse source path
    const sourcePage = (function () {
      if (params.sourcePath) return params.sourcePath;
      if (params.source) {
        try {
          const url = params.source;
          const match = url.match(/^https?:\/\/[^/]+(\/[^?#]*)/i);
          return match ? match[1] : url;
        } catch (err) {
          return params.source;
        }
      }
      return '';
    })();

    // UA summary
    function summarizeUA(ua) {
      if (!ua) return '';
      const device = /iPhone/i.test(ua)
        ? 'iPhone'
        : /iPad/i.test(ua)
        ? 'iPad'
        : /Android/i.test(ua)
        ? 'Android'
        : /Macintosh|Mac OS X/i.test(ua)
        ? 'Mac'
        : /Windows/i.test(ua)
        ? 'Windows'
        : 'Other';

      const browser = /Edg\//i.test(ua)
        ? 'Edge'
        : /Chrome\//i.test(ua)
        ? 'Chrome'
        : /Safari\//i.test(ua) && !/Chrome\//i.test(ua)
        ? 'Safari'
        : /Firefox\//i.test(ua)
        ? 'Firefox'
        : 'Other';
      return device + ' / ' + browser;
    }

    const uaSummary = summarizeUA(params.ua || '');

    // Age (days) column uses formula, references current row column H (Created Local)
    // User requested formula: =DATEVALUE(TODAY()-DATEVALUE(H2))
    // Using INDEX(H:H, ROW()) to dynamically reference the current row's H column
    const ageFormula = '=DATEVALUE(TODAY()-DATEVALUE(INDEX(H:H, ROW())))';

    // Default values
    // Note: contactType and category are now passed via config (hidden fields) instead of user input
    const assignedTo = params.assignedTo || '';
    const status = params.status || 'New';
    const role = params.role || 'Recruit Complete Vistor'; // Default role
    const lastActionDate = '';
    const outcomeNotes = '';
    const internalTag = params.internalTag || '';
    const followUpDate = params.followUpDate || '';
    const contactType = params.contactType || ''; // From config, not user-selected
    const category = params.category || ''; // Can be from config or user-selected (in default variant)

    // Assemble row data (corresponds to header order)
    // Note: If Role column position is different, adjust the array order accordingly
    const rowData = [
      nextId, // ID
      status, // Status
      category, // Category
      params.message || '', // Message
      params.name || '', // Name
      params.email || '', // Email
      createdUtc, // Created UTC
      createdLocal, // Created Local (AEST) - Column H
      ageFormula, // Age (days) - Formula references column H
      role, // Role - Default: Recruit Complete Visitor
      contactType, // Contact Type
      sourcePage, // Source Page
      uaSummary, // Device/UA
      assignedTo, // Assigned To
      lastActionDate, // Last Action Date
      outcomeNotes, // Outcome / Notes
      internalTag, // Internal Tag
      followUpDate, // Follow Up Date
    ];

    // Write to Sheet
    sheet.appendRow(rowData);

    // Send email notifications (if enabled)
    if (EMAIL_ENABLED) {
      try {
        sendEmailNotifications({
          name: params.name,
          email: params.email,
          message: params.message || '',
          category: category,
          contactType: contactType,
          timestamp: createdLocal,
          submissionId: nextId,
        });
      } catch (emailError) {
        // Log email error but don't fail the submission
        Logger.log('Email sending error: ' + emailError.toString());
        // Continue with success response even if email fails
      }
    }

    // Return success response
    return createResponse({
      success: true,
      message: 'Data saved successfully',
      timestamp: createdUtc,
    });
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return createResponse({ success: false, error: error.toString() }, 500);
  }
}

// ========== Handle GET Request ==========
function doGet(e) {
  return createResponse({
    success: true,
    message: 'GET method not supported. Please use POST.',
  });
}

// ========== Email Notification Functions ==========
/**
 * Send email notifications after form submission
 * @param {Object} submissionData - The form submission data
 */
function sendEmailNotifications(submissionData) {
  const {
    name,
    email,
    message,
    category,
    contactType,
    timestamp,
    submissionId,
  } = submissionData;

  // Send confirmation email to the submitter
  sendConfirmationEmail(email, name, timestamp);

  // Send notification email to the company
  sendNotificationEmail(
    name,
    email,
    message,
    category,
    contactType,
    timestamp,
    submissionId,
  );
}

/**
 * Send confirmation email to the person who submitted the form
 * @param {string} toEmail - Recipient email address
 * @param {string} name - Recipient name
 * @param {string} timestamp - Submission timestamp
 */
function sendConfirmationEmail(toEmail, name, timestamp) {
  const subject = `Thank you for contacting ${COMPANY_NAME}`;

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Thank You for Contacting Us!</h1>
        </div>
        <div class="content">
          <p>Dear ${name},</p>
          <p>We have successfully received your message submitted on ${timestamp}.</p>
          <p>Our team will review your inquiry and get back to you as soon as possible. We typically respond within 24-48 hours during business days.</p>
          <p>If you have any urgent matters, please feel free to contact us directly.</p>
          <p>Best regards,<br><strong>${COMPANY_NAME} Team</strong></p>
        </div>
        <div class="footer">
          <p>This is an automated confirmation email. Please do not reply to this message.</p>
          <p>If you have any questions, please contact us at ${REPLY_TO_EMAIL}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const plainBody = `
Dear ${name},

We have successfully received your message submitted on ${timestamp}.

Our team will review your inquiry and get back to you as soon as possible. We typically respond within 24-48 hours during business days.

If you have any urgent matters, please feel free to contact us directly.

Best regards,
${COMPANY_NAME} Team

---
This is an automated confirmation email. Please do not reply to this message.
If you have any questions, please contact us at ${REPLY_TO_EMAIL}
  `;

  try {
    MailApp.sendEmail({
      to: toEmail,
      subject: subject,
      body: plainBody,
      htmlBody: htmlBody,
      replyTo: REPLY_TO_EMAIL,
      name: COMPANY_NAME,
    });
    Logger.log('Confirmation email sent to: ' + toEmail);
  } catch (error) {
    Logger.log('Error sending confirmation email: ' + error.toString());
    throw error;
  }
}

/**
 * Send notification email to the company about the new submission
 * @param {string} name - Submitter's name
 * @param {string} email - Submitter's email
 * @param {string} message - Submission message
 * @param {string} category - Inquiry category
 * @param {string} contactType - Contact type
 * @param {string} timestamp - Submission timestamp
 * @param {number} submissionId - Submission ID
 */
function sendNotificationEmail(
  name,
  email,
  message,
  category,
  contactType,
  timestamp,
  submissionId,
) {
  const subject = `New Contact Form Submission #${submissionId} - ${
    category || 'General Inquiry'
  }`;

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #059669; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
        .info-box { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #059669; border-radius: 4px; }
        .info-label { font-weight: bold; color: #059669; margin-right: 10px; }
        .message-box { background-color: #f3f4f6; padding: 15px; margin: 15px 0; border-radius: 4px; white-space: pre-wrap; }
        .button { display: inline-block; padding: 12px 24px; background-color: #059669; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Contact Form Submission</h1>
        </div>
        <div class="content">
          <p>You have received a new contact form submission:</p>
          
          <div class="info-box">
            <div><span class="info-label">Submission ID:</span> #${submissionId}</div>
            <div><span class="info-label">Name:</span> ${name}</div>
            <div><span class="info-label">Email:</span> <a href="mailto:${email}">${email}</a></div>
            <div><span class="info-label">Category:</span> ${
              category || 'General Inquiry'
            }</div>
            ${
              contactType
                ? `<div><span class="info-label">Contact Type:</span> ${contactType}</div>`
                : ''
            }
            <div><span class="info-label">Submitted:</span> ${timestamp}</div>
          </div>

          ${
            message
              ? `
          <div>
            <strong>Message:</strong>
            <div class="message-box">${message.replace(/\n/g, '<br>')}</div>
          </div>
          `
              : ''
          }

          <p>
            <a href="mailto:${email}?subject=Re: ${encodeURIComponent(
    category || 'Your Inquiry',
  )}" class="button">
              Reply to ${name}
            </a>
          </p>
        </div>
        <div class="footer">
          <p>This is an automated notification from ${COMPANY_NAME} contact form system.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const plainBody = `
New Contact Form Submission

Submission ID: #${submissionId}
Name: ${name}
Email: ${email}
Category: ${category || 'General Inquiry'}
${contactType ? `Contact Type: ${contactType}\n` : ''}Submitted: ${timestamp}

${message ? `Message:\n${message}\n` : ''}

---
Reply to this inquiry: mailto:${email}?subject=Re: ${category || 'Your Inquiry'}

This is an automated notification from ${COMPANY_NAME} contact form system.
  `;

  try {
    MailApp.sendEmail({
      to: NOTIFICATION_EMAIL,
      subject: subject,
      body: plainBody,
      htmlBody: htmlBody,
      replyTo: email, // Set reply-to to the submitter's email for easy reply
      name: COMPANY_NAME + ' Contact Form',
    });
    Logger.log('Notification email sent to: ' + NOTIFICATION_EMAIL);
  } catch (error) {
    Logger.log('Error sending notification email: ' + error.toString());
    throw error;
  }
}

// ========== Create Response Object ==========
function createResponse(data, statusCode = 200) {
  // ContentService automatically handles CORS when deployed as Web App
  // with "Who has access: Anyone" setting
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

// ========== Test Function ==========
function testAppendRow() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  const now = new Date();
  const createdUtc = now.toISOString();
  const createdLocal = Utilities.formatDate(
    now,
    'Australia/Sydney',
    'yyyy/MM/dd HH:mm',
  );
  const lastRow = sheet.getLastRow();
  let nextId = 1001;
  if (lastRow >= 2) {
    const lastIdCell = sheet.getRange(lastRow, 1).getValue();
    const parsed = parseInt(lastIdCell, 10);
    if (!isNaN(parsed)) nextId = parsed + 1;
  }
  const ageFormula = '=DATEVALUE(TODAY()-DATEVALUE(INDEX(H:H, ROW())))'; // Updated to use column H
  const testRow = [
    nextId, // ID
    'New', // Status
    'Merchant Onboarding', // Category
    'I want to join Rewowo', // Message
    'Test User', // Name
    'test@example.com', // Email
    createdUtc, // Created UTC
    createdLocal, // Created Local (AEST) - Column H
    ageFormula, // Age (days) - Formula references column H
    'Recruit Complete Visitor', // Role - Default: Recruit Complete Visitor
    'Merchant', // Contact Type
    '/merchant-join', // Source Page
    'iPhone / Safari', // Device/UA
    'Ravi', // Assigned To
    '', // Last Action Date
    '', // Outcome / Notes
    'VIP', // Internal Tag
    '', // Follow Up Date
  ];
  sheet.appendRow(testRow);
  Logger.log('Test row appended for new schema');
}

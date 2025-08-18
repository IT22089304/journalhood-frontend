/**
 * Firebase Email Template Customization
 * You can customize Firebase's built-in email templates in the Firebase Console
 * Go to: Firebase Console > Authentication > Templates
 */

export const firebaseEmailTemplates = {
  // Password Reset Template
  passwordReset: {
    subject: "Reset Your JournalHood Password",
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #4f46e5; color: white; padding: 20px; text-align: center;">
          <h1>JournalHood</h1>
          <h2>Password Reset Request</h2>
        </div>
        
        <div style="padding: 30px; background-color: #f8fafc;">
          <p>Hello,</p>
          
          <p>You're receiving this email because a password reset was requested for your JournalHood account.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="%LINK%" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Reset Your Password
            </a>
          </div>
          
          <p><strong>Important:</strong> This link will expire in 1 hour for security purposes.</p>
          
          <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
          
          <p>Best regards,<br>The JournalHood Team</p>
        </div>
        
        <div style="background-color: #e5e7eb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
          <p>This email was sent to %EMAIL%. If you have any questions, please contact our support team.</p>
        </div>
      </div>
    `,
  },

  // Email Verification Template
  emailVerification: {
    subject: "Verify Your JournalHood Email",
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #4f46e5; color: white; padding: 20px; text-align: center;">
          <h1>JournalHood</h1>
          <h2>Verify Your Email</h2>
        </div>
        
        <div style="padding: 30px; background-color: #f8fafc;">
          <p>Welcome to JournalHood!</p>
          
          <p>Please verify your email address to complete your account setup.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="%LINK%" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Verify Email
            </a>
          </div>
          
          <p>If you didn't create this account, please ignore this email.</p>
          
          <p>Welcome to the JournalHood community!</p>
          <p>The JournalHood Team</p>
        </div>
      </div>
    `,
  },
};

/**
 * Steps to customize Firebase email templates:
 * 
 * 1. Go to Firebase Console > Authentication > Templates
 * 2. Select "Password reset" or "Email address verification"
 * 3. Click "Edit template"
 * 4. Customize the subject and body
 * 5. Use variables like %LINK%, %EMAIL%, %APP_NAME%
 * 6. Save changes
 * 
 * Available variables:
 * - %LINK% - The action link (password reset or email verification)
 * - %EMAIL% - The user's email address
 * - %APP_NAME% - Your app name from Firebase settings
 * - %DISPLAY_NAME% - User's display name (if available)
 */

export const firebaseEmailConfiguration = {
  // Action URL configuration
  actionUrl: {
    passwordReset: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    emailVerification: `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email`,
  },
  
  // Sender configuration
  sender: {
    name: "JournalHood",
    email: "noreply@journalhood.com", // Configure in Firebase Console > Authentication > Settings
  },
}; 
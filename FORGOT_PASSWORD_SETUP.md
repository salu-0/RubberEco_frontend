# Forgot Password Setup Guide

## Overview
The forgot password functionality has been implemented with the following features:
- Email-based password reset
- Secure token generation with expiration
- User-friendly UI components
- Complete backend API integration

## Setup Instructions

### 1. Email Configuration

To enable email sending for password reset, you need to configure email settings in your `.env` file:

```bash
# Copy the example file
cp backend/.env.example backend/.env
```

Then edit `backend/.env` and add your email configuration:

```env
# Email Configuration for Password Reset
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here
```

### 2. Gmail Setup (Recommended)

If using Gmail:

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this app password in `EMAIL_PASS`

### 3. Alternative Email Services

You can modify the email transporter in `backend/controllers/authController.js` to use other services:

```javascript
// For Outlook/Hotmail
service: 'hotmail'

// For Yahoo
service: 'yahoo'

// For custom SMTP
host: 'smtp.yourdomain.com',
port: 587,
secure: false, // true for 465, false for other ports
```

## How It Works

### 1. Forgot Password Flow

1. User clicks "Forgot your password?" on login page
2. User enters email address
3. System generates a secure reset token
4. Email with reset link is sent to user
5. User clicks the link to access reset password page
6. User enters new password
7. Password is updated and user can login

### 2. Security Features

- **Token Expiration**: Reset tokens expire after 1 hour
- **Secure Hashing**: Tokens are hashed before storage
- **No User Enumeration**: Same response whether email exists or not
- **Password Validation**: Minimum 6 characters required

### 3. API Endpoints

- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

## Frontend Components

### 1. ForgotPassword Component
- Located at: `src/components/Auth/ForgotPassword.jsx`
- Route: `/forgot-password`
- Features: Email validation, loading states, success/error messages

### 2. ResetPassword Component
- Located at: `src/components/Auth/ResetPassword.jsx`
- Route: `/reset-password?token=<reset_token>`
- Features: Token validation, password confirmation, auto-redirect

## Testing

### 1. Test Without Email (Development)

For testing without setting up email, you can:

1. Check the backend console for the reset token
2. Manually construct the reset URL: `http://localhost:5174/reset-password?token=<token>`
3. Use the URL to test the reset functionality

### 2. Test With Email

1. Set up email configuration as described above
2. Go to login page and click "Forgot your password?"
3. Enter a valid email address
4. Check your email for the reset link
5. Click the link and enter a new password

## Database Changes

The User model has been updated with new fields:
- `resetPasswordToken`: Stores hashed reset token
- `resetPasswordExpires`: Token expiration timestamp

## Troubleshooting

### Common Issues

1. **Email not sending**:
   - Check EMAIL_USER and EMAIL_PASS in .env
   - Verify Gmail app password is correct
   - Check backend console for error messages

2. **Invalid token error**:
   - Token may have expired (1 hour limit)
   - Request a new password reset

3. **Frontend not loading**:
   - Ensure both backend (port 5000) and frontend (port 5174) are running
   - Check browser console for errors

### Error Messages

- `Email service is currently unavailable`: Email configuration issue
- `Invalid or expired reset token`: Token is invalid or expired
- `Token and new password are required`: Missing required fields

## Security Considerations

1. **Rate Limiting**: Consider adding rate limiting to prevent abuse
2. **Email Validation**: Only send emails to verified email addresses
3. **Token Storage**: Tokens are hashed before database storage
4. **HTTPS**: Use HTTPS in production for secure token transmission

## Production Deployment

1. Set `FRONTEND_URL` to your production domain
2. Use environment variables for all sensitive data
3. Consider using a dedicated email service (SendGrid, Mailgun, etc.)
4. Implement proper logging and monitoring

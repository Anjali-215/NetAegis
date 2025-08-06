# Email Setup Guide for NetAegis

## Overview
This guide will help you set up email functionality for the password reset feature in NetAegis. The system uses Gmail SMTP for sending password reset emails.

## Prerequisites

### 1. Gmail Account Setup
1. **Enable 2-Factor Authentication**
   - Go to your Google Account settings
   - Navigate to Security
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to Google Account settings
   - Navigate to Security
   - Under "2-Step Verification", click "App passwords"
   - Select "Mail" and "Other (Custom name)"
   - Enter "NetAegis" as the name
   - Copy the generated 16-character password

## Configuration Steps

### 1. Create Environment File
Create a `.env` file in the `backend` directory:

```bash
cd backend
touch .env
```

### 2. Add Email Configuration
Add the following variables to your `.env` file:

```env
# Email Configuration
MAIL_USERNAME=your-gmail@gmail.com
MAIL_PASSWORD=your-16-character-app-password
MAIL_FROM=your-gmail@gmail.com
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_FROM_NAME=NetAegis Security
```

### 3. Example Configuration
```env
MAIL_USERNAME=admin@netaegis.com
MAIL_PASSWORD=abcd efgh ijkl mnop
MAIL_FROM=admin@netaegis.com
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_FROM_NAME=NetAegis Security
```

## Testing Email Setup

### 1. Run Email Test
```bash
python test_email_functionality.py
```

### 2. Expected Output
```
🧪 Testing Email Service
==================================================
1. Checking email configuration...
   Mail Server: smtp.gmail.com
   Mail Port: 587
   Mail Username: your-gmail@gmail.com
   Mail From: your-gmail@gmail.com
   Mail From Name: NetAegis Security

✅ Email configuration looks good!

2. Testing email sending...
✅ Email sent successfully!
   Check test@example.com for the test email
```

## Troubleshooting

### Common Issues

1. **"Authentication failed" error**
   - Ensure 2-factor authentication is enabled
   - Use App Password, not your regular password
   - Check that the App Password is copied correctly

2. **"Connection refused" error**
   - Check if port 587 is blocked by firewall
   - Try using port 465 with SSL instead
   - Ensure your network allows SMTP connections

3. **"Invalid credentials" error**
   - Double-check your Gmail username
   - Ensure App Password is generated correctly
   - Make sure you're using the App Password, not your regular password

### Alternative Email Providers

#### Outlook/Hotmail
```env
MAIL_SERVER=smtp-mail.outlook.com
MAIL_PORT=587
```

#### Yahoo Mail
```env
MAIL_SERVER=smtp.mail.yahoo.com
MAIL_PORT=587
```

#### Custom SMTP Server
```env
MAIL_SERVER=your-smtp-server.com
MAIL_PORT=587
```

## Security Considerations

1. **Never commit .env file**
   - Add `.env` to your `.gitignore` file
   - Keep email credentials secure

2. **Use App Passwords**
   - Never use your main account password
   - Generate specific App Passwords for each service

3. **Regular Password Rotation**
   - Change App Passwords periodically
   - Monitor for suspicious activity

## Integration with NetAegis

### Password Reset Flow
1. Admin clicks yellow shield icon in User Management
2. System generates reset token
3. Email is sent to user with reset links
4. User clicks link to reset password
5. Password is updated in MongoDB

### Email Templates
The system includes professional HTML email templates for:
- Password reset requests
- Security alerts
- Threat notifications
- CSV analysis summaries

## Testing the Complete Flow

### 1. Start the Backend
```bash
cd backend
python main.py
```

### 2. Start the Frontend
```bash
cd frontend
npm run dev
```

### 3. Test Password Reset
1. Login as admin
2. Go to User Management
3. Click the yellow shield icon next to any user
4. Check the user's email for reset link
5. Test the reset functionality

## Monitoring and Logs

### Backend Logs
The system logs email activities:
```
INFO: Password reset email sent to user@example.com
ERROR: Failed to send password reset email: Authentication failed
```

### Email Delivery Tracking
- Check Gmail's "Sent" folder
- Monitor for bounce-backs
- Review email delivery reports

## Advanced Configuration

### Custom Email Templates
You can modify email templates in `backend/utils/email_service.py`:
- HTML styling
- Company branding
- Custom messages

### Rate Limiting
Consider implementing rate limiting for password reset requests:
- Maximum 3 requests per hour per user
- Cooldown period between requests

### Email Queue
For production, consider implementing an email queue:
- Redis for job queuing
- Background workers for email sending
- Retry logic for failed emails

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify your email configuration
3. Test with the provided test script
4. Review backend logs for detailed error messages

## Production Deployment

For production deployment:
1. Use environment variables for all sensitive data
2. Implement proper logging and monitoring
3. Set up email delivery monitoring
4. Configure backup email providers
5. Implement rate limiting and security measures 
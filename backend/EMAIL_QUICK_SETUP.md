# Quick Email Setup Guide

## Issue
You're seeing this warning: `WARNING:main:Failed to send processing completion email for file: threat_samples_to_test.csv`

This happens because the email service is not properly configured.

## Quick Fix

### Step 1: Create .env file
Create a file named `.env` in the `backend` directory with the following content:

```env
# Email Configuration
MAIL_USERNAME=your-actual-email@gmail.com
MAIL_PASSWORD=your-16-character-app-password
MAIL_FROM=your-actual-email@gmail.com
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_FROM_NAME=NetAegis Security
```

### Step 2: Get Gmail App Password
1. Go to your Google Account settings
2. Navigate to Security > 2-Step Verification
3. Click on "App passwords"
4. Generate a new app password for "Mail"
5. Copy the 16-character password
6. Replace `your-16-character-app-password` in the .env file

### Step 3: Update Email Address
Replace `your-actual-email@gmail.com` with your actual Gmail address in the .env file.

### Step 4: Restart Backend
Restart your backend server for the changes to take effect.

## Alternative: Disable Email Notifications
If you don't want email notifications, the system will continue to work without them. The warning will appear but won't affect the main functionality.

## Test Email Configuration
After setup, you can test the email configuration by:
1. Making a POST request to `/test-email` endpoint
2. Or uploading a CSV file and checking if emails are sent

## For Other Email Providers
See `EMAIL_SETUP.md` for configuration details for Outlook, Yahoo, or custom SMTP servers. 
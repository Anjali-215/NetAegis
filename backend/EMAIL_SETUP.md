# Email Notification Setup Guide

## Overview
NetAegis now includes automatic email notifications for detected threats. When a threat is detected during CSV analysis, the system will automatically send an alert email to the logged-in user.

## Email Configuration

### 1. Gmail Setup (Recommended)

#### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification

#### Step 2: Generate App Password
1. Go to Google Account settings
2. Navigate to Security > 2-Step Verification
3. Click on "App passwords"
4. Generate a new app password for "Mail"
5. Copy the 16-character password

#### Step 3: Update Environment Variables
Create or update your `.env` file in the backend directory:

```env
# Email Configuration
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-16-character-app-password
MAIL_FROM=your-email@gmail.com
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_FROM_NAME=NetAegis Security
```

### 2. Other Email Providers

For other email providers, update the configuration accordingly:

#### Outlook/Hotmail:
```env
MAIL_SERVER=smtp-mail.outlook.com
MAIL_PORT=587
```

#### Yahoo:
```env
MAIL_SERVER=smtp.mail.yahoo.com
MAIL_PORT=587
```

#### Custom SMTP:
```env
MAIL_SERVER=your-smtp-server.com
MAIL_PORT=587
```

## Email Templates

The system includes two types of email templates:

### 1. Threat Alert Email
- **Trigger**: When a threat is detected during CSV analysis
- **Content**: Detailed threat information, confidence level, recommended actions
- **Design**: Professional HTML template with NetAegis branding

### 2. General Alert Email
- **Trigger**: For general security notifications
- **Content**: Customizable message content
- **Design**: Simple, clean HTML template

## Testing Email Configuration

### 1. Test Email Service
You can test the email configuration by making a prediction request with threat detection:

1. Upload a CSV file with threat data
2. Check if the prediction detects a threat (non-normal)
3. Verify that an email is sent to the logged-in user

### 2. Manual Testing
You can also test the email service directly by adding a test endpoint:

```python
@app.post("/test-email")
async def test_email():
    try:
        email_service = EmailService()
        result = await email_service.send_threat_alert(
            "test@example.com",
            "Test User",
            {
                "threat_type": "ddos",
                "confidence": 85.5,
                "timestamp": "2024-01-15 10:30:00",
                "threat_level": "Critical"
            }
        )
        return {"success": result}
    except Exception as e:
        return {"error": str(e)}
```

## Troubleshooting

### Common Issues:

1. **Authentication Failed**
   - Ensure you're using an App Password, not your regular password
   - Verify 2-Factor Authentication is enabled
   - Check that the email and password are correct

2. **Connection Timeout**
   - Verify the SMTP server and port are correct
   - Check your firewall settings
   - Ensure the email provider allows SMTP access

3. **Email Not Sent**
   - Check the backend logs for error messages
   - Verify the user email is valid
   - Ensure the threat detection is working properly

### Debug Logs
The email service includes detailed logging. Check the backend console for:
- Email configuration loading
- SMTP connection attempts
- Email sending success/failure messages

## Security Considerations

1. **App Passwords**: Use app-specific passwords instead of your main password
2. **Environment Variables**: Never commit email credentials to version control
3. **Rate Limiting**: Be aware of email provider rate limits
4. **Privacy**: Ensure user consent for email notifications

## Customization

### Email Template Customization
You can customize the email templates by modifying the HTML content in `utils/email_service.py`:

1. **Threat Alert Template**: Modify `_create_threat_alert_html()`
2. **General Alert Template**: Modify `send_general_alert()`

### Email Content
The threat alert email includes:
- Threat type and confidence level
- Detection timestamp
- Recommended actions
- Professional styling with NetAegis branding

## Integration Points

The email notification system integrates with:
- CSV upload and analysis
- Threat prediction API
- User authentication system
- Frontend user management

## Future Enhancements

Potential improvements:
1. Email preferences per user
2. Different email templates for different threat types
3. Email scheduling and batching
4. SMS notifications integration
5. Webhook notifications 
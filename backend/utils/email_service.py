import os
from typing import List, Optional
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import EmailStr
import logging
from config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        # Email configuration from settings
        self.conf = ConnectionConfig(
            MAIL_USERNAME=settings.MAIL_USERNAME,
            MAIL_PASSWORD=settings.MAIL_PASSWORD,
            MAIL_FROM=settings.MAIL_FROM,
            MAIL_PORT=settings.MAIL_PORT,
            MAIL_SERVER=settings.MAIL_SERVER,
            MAIL_FROM_NAME=settings.MAIL_FROM_NAME,
            MAIL_STARTTLS=True,
            MAIL_SSL_TLS=False,
            USE_CREDENTIALS=True,
            VALIDATE_CERTS=True
        )
        self.fastmail = FastMail(self.conf)

    async def send_threat_alert(self, user_email: str, user_name: str, threat_details: dict):
        """
        Send threat alert email to user
        """
        try:
            # Create email template
            subject = "🚨 Security Alert: Threat Detected in Your Network"
            
            # Create detailed message based on threat type
            threat_type = threat_details.get('threat_type', 'Unknown')
            confidence = threat_details.get('confidence', 0)
            timestamp = threat_details.get('timestamp', 'Unknown')
            
            # Draft email content
            html_content = self._create_threat_alert_html(
                user_name, threat_type, confidence, timestamp
            )
            
            # Create message schema
            message = MessageSchema(
                subject=subject,
                recipients=[user_email],
                body=html_content,
                subtype="html"
            )
            
            # Send email
            await self.fastmail.send_message(message)
            logger.info(f"Threat alert email sent to {user_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send threat alert email: {str(e)}")
            return False

    def _create_threat_alert_html(self, user_name: str, threat_type: str, confidence: float, timestamp: str):
        """
        Create HTML email template for threat alerts
        """
        confidence_percentage = f"{confidence:.1f}%" if confidence else "High"
        
        html_template = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Security Alert - NetAegis</title>
            <style>
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    margin: 0;
                    padding: 0;
                    background-color: #f4f4f4;
                }}
                .container {{
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }}
                .header {{
                    background: linear-gradient(135deg, #b71c1c 0%, #7f0000 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                }}
                .header h1 {{
                    margin: 0;
                    font-size: 24px;
                    font-weight: bold;
                }}
                .alert-icon {{
                    font-size: 48px;
                    margin-bottom: 15px;
                }}
                .content {{
                    padding: 30px;
                }}
                .alert-box {{
                    background-color: #fff3cd;
                    border: 1px solid #ffeaa7;
                    border-radius: 6px;
                    padding: 20px;
                    margin: 20px 0;
                }}
                .alert-title {{
                    color: #856404;
                    font-weight: bold;
                    font-size: 18px;
                    margin-bottom: 10px;
                }}
                .details {{
                    background-color: #f8f9fa;
                    border-radius: 6px;
                    padding: 20px;
                    margin: 20px 0;
                }}
                .detail-row {{
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10px;
                    padding: 8px 0;
                    border-bottom: 1px solid #e9ecef;
                }}
                .detail-row:last-child {{
                    border-bottom: none;
                }}
                .detail-label {{
                    font-weight: bold;
                    color: #495057;
                }}
                .detail-value {{
                    color: #6c757d;
                }}
                .footer {{
                    background-color: #f8f9fa;
                    padding: 20px;
                    text-align: center;
                    color: #6c757d;
                    font-size: 14px;
                }}
                .button {{
                    display: inline-block;
                    background: linear-gradient(135deg, #b71c1c 0%, #7f0000 100%);
                    color: white;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: bold;
                    margin-top: 20px;
                }}
                .warning {{
                    color: #dc3545;
                    font-weight: bold;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="alert-icon">🚨</div>
                    <h1>Security Alert</h1>
                    <p>NetAegis Threat Detection System</p>
                </div>
                
                <div class="content">
                    <p>Dear <strong>{user_name}</strong>,</p>
                    
                    <div class="alert-box">
                        <div class="alert-title">⚠️ Threat Detected</div>
                        <p>Our security system has detected a potential threat in your network analysis. 
                        Please review the details below and take appropriate action.</p>
                    </div>
                    
                    <div class="details">
                        <div class="detail-row">
                            <span class="detail-label">Threat Type:</span>
                            <span class="detail-value warning">{threat_type}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Confidence Level:</span>
                            <span class="detail-value">{confidence_percentage}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Detection Time:</span>
                            <span class="detail-value">{timestamp}</span>
                        </div>
                    </div>
                    
                    <p><strong>Recommended Actions:</strong></p>
                    <ul>
                        <li>Review the detected threat in your NetAegis dashboard</li>
                        <li>Check your network logs for suspicious activity</li>
                        <li>Update your security policies if necessary</li>
                        <li>Contact your IT security team if needed</li>
                    </ul>
                    
                    <p>This is an automated alert from your NetAegis security system. 
                    Please log into your dashboard for more detailed information and analysis.</p>
                    
                    <div style="text-align: center;">
                        <a href="#" class="button">View Dashboard</a>
                    </div>
                </div>
                
                <div class="footer">
                    <p>This is an automated message from NetAegis Security System.</p>
                    <p>If you have any questions, please contact your system administrator.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return html_template

    async def send_general_alert(self, user_email: str, user_name: str, message: str):
        """
        Send general security alert email
        """
        try:
            subject = "🔒 NetAegis Security Alert"
            
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Security Alert</title>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: #b71c1c; color: white; padding: 20px; text-align: center; }}
                    .content {{ padding: 20px; background: #f9f9f9; }}
                    .footer {{ text-align: center; padding: 20px; color: #666; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔒 Security Alert</h1>
                        <p>NetAegis Security System</p>
                    </div>
                    <div class="content">
                        <p>Dear <strong>{user_name}</strong>,</p>
                        <p>{message}</p>
                        <p>Please review your dashboard for more details.</p>
                    </div>
                    <div class="footer">
                        <p>This is an automated message from NetAegis.</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            message_schema = MessageSchema(
                subject=subject,
                recipients=[user_email],
                body=html_content,
                subtype="html"
            )
            
            await self.fastmail.send_message(message_schema)
            logger.info(f"General alert email sent to {user_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send general alert email: {str(e)}")
            return False 
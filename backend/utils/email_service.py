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

    async def send_password_reset_email(self, user_email: str, user_name: str, reset_link: str, atlas_link: str = None):
        """
        Send password reset email to user
        """
        try:
            subject = "NetAegis Password Reset Request"
            
            html_content = self._create_password_reset_html(user_name, reset_link, atlas_link)
            
            message = MessageSchema(
                subject=subject,
                recipients=[user_email],
                body=html_content,
                subtype="html"
            )
            
            await self.fastmail.send_message(message)
            logger.info(f"Password reset email sent to {user_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send password reset email: {str(e)}")
            return False

    async def send_welcome_email(self, user_email: str, user_name: str, company_name: str, admin_name: str, setup_link: str, atlas_link: str = None):
        """
        Send welcome email to new user added by admin
        """
        try:
            subject = "Welcome to NetAegis - Your Account is Ready!"
            
            html_content = self._create_welcome_html(user_name, company_name, admin_name, setup_link, atlas_link)
            
            message = MessageSchema(
                subject=subject,
                recipients=[user_email],
                body=html_content,
                subtype="html"
            )
            
            await self.fastmail.send_message(message)
            logger.info(f"Welcome email sent to {user_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send welcome email: {str(e)}")
            return False

    def _create_password_reset_html(self, user_name: str, reset_link: str, atlas_link: str = None):
        """
        Create HTML email template for password reset
        """
        html_template = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset - NetAegis</title>
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
                .content {{
                    padding: 30px;
                }}
                .reset-box {{
                    background-color: #e8f5e8;
                    border: 1px solid #c3e6c3;
                    border-radius: 6px;
                    padding: 20px;
                    margin: 20px 0;
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
                .footer {{
                    background-color: #f8f9fa;
                    padding: 20px;
                    text-align: center;
                    color: #6c757d;
                    font-size: 14px;
                }}
                .warning {{
                    background-color: #fff3cd;
                    border: 1px solid #ffeaa7;
                    border-radius: 6px;
                    padding: 15px;
                    margin: 20px 0;
                    color: #856404;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Password Reset</h1>
                    <p>NetAegis Security System</p>
                </div>
                
                <div class="content">
                    <p>Dear <strong>{user_name}</strong>,</p>
                    
                    <div class="reset-box">
                        <h3>Password Reset Request</h3>
                        <p>We received a request to reset your password for your NetAegis account. 
                        This link will take you to our secure password reset page where you can create a new password for your account.</p>
                    </div>
                    
                    <p>To reset your password, click the button below:</p>
                    
                    <div style="text-align: center;">
                        <a href="{reset_link}" class="button">Reset Password</a>
                    </div>
                    
                    <div class="warning">
                        <strong>Important:</strong>
                        <ul>
                            <li>This link will expire in 1 hour for security reasons</li>
                            <li>If you didn't request this password reset, please ignore this email</li>
                            <li>For security, this link can only be used once</li>
                            <li>Your new password must be at least 6 characters long, including uppercase, number, and special character</li>
                        </ul>
                    </div>
                    
                    <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #6c757d; font-size: 12px;">{reset_link}</p>
                    
                    <p>If you have any questions or concerns, please contact your system administrator.</p>
                </div>
                
                <div class="footer">
                    <p>This is an automated message from NetAegis Security System.</p>
                    <p>Please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return html_template

    def _create_welcome_html(self, user_name: str, company_name: str, admin_name: str, setup_link: str, atlas_link: str = None):
        """
        Create HTML email template for welcome email
        """
        # Atlas section removed for professional appearance
        
        html_template = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to NetAegis</title>
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
                .welcome-icon {{
                    font-size: 48px;
                    margin-bottom: 15px;
                }}
                .content {{
                    padding: 30px;
                }}
                .welcome-box {{
                    background-color: #e8f5e8;
                    border: 1px solid #c3e6c3;
                    border-radius: 6px;
                    padding: 20px;
                    margin: 20px 0;
                }}
                .features {{
                    background-color: #f8f9fa;
                    border-radius: 6px;
                    padding: 20px;
                    margin: 20px 0;
                }}
                .feature-item {{
                    display: flex;
                    align-items: center;
                    margin-bottom: 15px;
                }}
                .feature-icon {{
                    font-size: 20px;
                    margin-right: 10px;
                    color: #b71c1c;
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
                .footer {{
                    background-color: #f8f9fa;
                    padding: 20px;
                    text-align: center;
                    color: #6c757d;
                    font-size: 14px;
                }}
                .security-note {{
                    background-color: #fff3cd;
                    border: 1px solid #ffeaa7;
                    border-radius: 6px;
                    padding: 15px;
                    margin: 20px 0;
                    color: #856404;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to NetAegis</h1>
                    <p>Your Account is Ready!</p>
                </div>
                
                <div class="content">
                    <p>Dear <strong>{user_name}</strong>,</p>
                    
                    <div class="welcome-box">
                        <h3>Welcome to the World of Security!</h3>
                        <p>Your company <strong>{company_name}</strong> administrator <strong>{admin_name}</strong> has added you to NetAegis, our advanced network security platform.</p>
                        <p>You're now part of a team dedicated to protecting digital assets and maintaining robust cybersecurity defenses.</p>
                    </div>
                    
                    <div class="features">
                        <h3>What NetAegis Offers You:</h3>
                        <div class="feature-item">
                            <span class="feature-icon">•</span>
                            <span><strong>Advanced Threat Detection:</strong> AI-powered analysis of network traffic</span>
                        </div>
                        <div class="feature-item">
                            <span class="feature-icon">•</span>
                            <span><strong>Real-time Monitoring:</strong> Live security dashboards and alerts</span>
                        </div>
                        <div class="feature-item">
                            <span class="feature-icon">•</span>
                            <span><strong>Comprehensive Reports:</strong> Detailed security analytics and insights</span>
                        </div>
                        <div class="feature-item">
                            <span class="feature-icon">•</span>
                            <span><strong>AI Chatbot:</strong> Intelligent security assistance and threat analysis</span>
                        </div>
                        <div class="feature-item">
                            <span class="feature-icon">•</span>
                            <span><strong>File Analysis:</strong> Upload and analyze network data for threats</span>
                        </div>
                    </div>
                    
                    <p><strong>Next Steps:</strong></p>
                    <p>To get started, you need to set up your password. Click the button below to create your secure password:</p>
                    
                    <div style="text-align: center;">
                        <a href="{setup_link}" class="button">Set Your Password</a>
                    </div>
                    
                    <div class="security-note">
                        <strong>Security Note:</strong>
                        <ul>
                            <li>This setup link will expire in 1 hour for security reasons</li>
                            <li>Choose a strong password with at least 6 characters, including uppercase, number, and special character</li>
                            <li>Your account is secure and ready for immediate use</li>
                        </ul>
                    </div>
                    
                    <p>Welcome to the world of security! We're excited to have you on board.</p>
                    
                    <p>If you have any questions, please contact your system administrator.</p>
                </div>
                
                <div class="footer">
                    <p>This is an automated welcome message from NetAegis Security System.</p>
                    <p>Please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return html_template

    async def send_threat_alert(self, user_email: str, user_name: str, threat_details: dict):
        """
        Send threat alert email to user
        """
        try:
            # Create email template
            subject = "Security Alert: Threat Detected in Your Network"
            
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
                    <h1>Security Alert</h1>
                    <p>NetAegis Threat Detection System</p>
                </div>
                
                <div class="content">
                    <p>Dear <strong>{user_name}</strong>,</p>
                    
                    <div class="alert-box">
                        <div class="alert-title">Threat Detected</div>
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
            subject = "NetAegis Security Alert"
            
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
                        <h1>Security Alert</h1>
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

    async def send_csv_summary_alert(self, user_email: str, user_name: str, summary_data: dict):
        """
        Send summary email for CSV processing results
        """
        try:
            # Determine subject based on threat detection
            threat_count = summary_data.get('threat_count', 0)
            if threat_count > 0:
                subject = "Security Alert: Threats Detected in CSV Analysis"
            else:
                subject = "NetAegis CSV Analysis Complete - No Threats Found"
            
            # Extract summary data
            total_records = summary_data.get('total_records', 0)
            threat_count = summary_data.get('threat_count', 0)
            threat_types = summary_data.get('threat_types', {})
            processing_time = summary_data.get('processing_time', 0)
            file_name = summary_data.get('file_name', 'Unknown')
            
            # Create threat summary text
            threat_summary = ""
            if threat_types:
                threat_summary = "Detected threats:\n"
                for threat_type, count in threat_types.items():
                    threat_summary += f"• {threat_type}: {count} occurrences\n"
            else:
                threat_summary = "No threats detected in the analyzed data."
            
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>CSV Analysis Summary - NetAegis</title>
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
                    .content {{
                        padding: 30px;
                    }}
                    .summary-box {{
                        background-color: #e8f5e8;
                        border: 1px solid #c3e6c3;
                        border-radius: 6px;
                        padding: 20px;
                        margin: 20px 0;
                    }}
                    .threat-box {{
                        background-color: #fff3cd;
                        border: 1px solid #ffeaa7;
                        border-radius: 6px;
                        padding: 20px;
                        margin: 20px 0;
                    }}
                    .stats {{
                        background-color: #f8f9fa;
                        border-radius: 6px;
                        padding: 20px;
                        margin: 20px 0;
                    }}
                    .stat-row {{
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 10px;
                        padding: 8px 0;
                        border-bottom: 1px solid #e9ecef;
                    }}
                    .stat-row:last-child {{
                        border-bottom: none;
                    }}
                    .stat-label {{
                        font-weight: bold;
                        color: #495057;
                    }}
                    .stat-value {{
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
                    .success {{
                        color: #28a745;
                        font-weight: bold;
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>{'Security Alert' if threat_count > 0 else 'Analysis Complete'}</h1>
                        <p>NetAegis Threat Detection System</p>
                    </div>
                    
                    <div class="content">
                        <p>Dear <strong>{user_name}</strong>,</p>
                        
                        <div class="summary-box">
                            <h3>{'Threats Detected' if threat_count > 0 else 'Analysis Complete'}</h3>
                            <p>Your CSV file <strong>"{file_name}"</strong> has been successfully analyzed by our threat detection system.</p>
                        </div>
                        
                        <div class="stats">
                            <div class="stat-row">
                                <span class="stat-label">Total Records Analyzed:</span>
                                <span class="stat-value">{total_records}</span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-label">Threats Detected:</span>
                                <span class="stat-value" style="color: {'#dc3545' if threat_count > 0 else '#28a745'}; font-weight: bold; font-size: 16px;">{threat_count}</span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-label">Processing Time:</span>
                                <span class="stat-value">{processing_time:.2f} seconds</span>
                            </div>
                        </div>
                        
                        <div class="threat-box" style="background-color: {'#ffebee' if threat_count > 0 else '#fff3cd'}; border-color: {'#f44336' if threat_count > 0 else '#ffeaa7'};">
                            <h3>{'Threat Analysis Results' if threat_count > 0 else 'Threat Analysis Results'}</h3>
                            <p>{threat_summary}</p>
                        </div>
                        
                        {f'<div style="background-color: #ffebee; border: 2px solid #f44336; border-radius: 6px; padding: 15px; margin: 20px 0;"><h4 style="color: #d32f2f; margin: 0 0 10px 0;">IMMEDIATE ACTION REQUIRED</h4><p style="color: #d32f2f; margin: 0; font-weight: bold;">{threat_count} threat(s) detected in your network data. Please review immediately.</p></div>' if threat_count > 0 else ''}
                        <p><strong>Next Steps:</strong></p>
                        <ul>
                            <li>Review detailed results in your NetAegis dashboard</li>
                            <li>Check the threat visualization for patterns</li>
                            <li>Export results for further analysis if needed</li>
                            <li>Update security policies based on findings</li>
                        </ul>
                        
                        <div style="text-align: center;">
                            <a href="#" class="button">View Dashboard</a>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p>This is an automated summary from NetAegis Security System.</p>
                        <p>If you have any questions, please contact your system administrator.</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            message = MessageSchema(
                subject=subject,
                recipients=[user_email],
                body=html_content,
                subtype="html"
            )
            
            await self.fastmail.send_message(message)
            logger.info(f"CSV summary email sent to {user_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send CSV summary email: {str(e)}")
            return False 
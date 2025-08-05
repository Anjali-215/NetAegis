# 🗄️ Direct MongoDB Atlas Password Reset Guide

This guide shows how to implement password reset functionality that works **entirely through MongoDB Atlas** without requiring any backend server or hosting.

## 🎯 Overview

Users receive an email with direct links to MongoDB Atlas where they can reset their passwords directly in the cloud database.

## 📧 Email Template with Direct Atlas Links

### **Email Content:**
```
🔐 NetAegis Password Reset Request

Dear [User Name],

We received a request to reset your password for your NetAegis account.

You can reset your password directly in MongoDB Atlas using one of these methods:

1. 🔗 Direct Atlas Link:
   Click this link to go directly to your user document:
   https://cloud.mongodb.com/v2/YOUR_CLUSTER_ID/explorer/YOUR_DATABASE/users/find

2. 📋 Manual Steps:
   - Go to: https://cloud.mongodb.com
   - Log into your Atlas account
   - Navigate to: Database > Collections > users
   - Find your document by email: [user@example.com]
   - Update the 'hashed_password' field

3. 🔑 Security Token: [TOKEN]
   Email: [user@example.com]

⚠️ Important:
- This reset link expires in 1 hour
- Only use this if you requested the password reset
- For security, change your password immediately after reset

If you didn't request this reset, please ignore this email.

Best regards,
NetAegis Security Team
```

## 🛠️ Implementation Methods

### **Method 1: Direct Atlas Data Explorer Link**

1. **Get your Atlas cluster details:**
   - Cluster ID: Found in your Atlas dashboard
   - Database name: Your database name
   - Collection: `users`

2. **Create the direct link:**
   ```
   https://cloud.mongodb.com/v2/YOUR_CLUSTER_ID/explorer/YOUR_DATABASE/users/find
   ```

3. **User workflow:**
   - User clicks link in email
   - Opens MongoDB Atlas Data Explorer
   - User finds their document by email
   - User updates the `hashed_password` field
   - Password is updated directly in Atlas

### **Method 2: Atlas App Services (Recommended)**

1. **Set up MongoDB Atlas App Services:**
   - Go to your Atlas dashboard
   - Navigate to "App Services"
   - Create a new app

2. **Create a password reset app:**
   ```javascript
   // Atlas App Services function
   exports.resetPassword = async function(token, newPassword) {
     const { db } = context.services.get("mongodb-atlas");
     const users = db.collection("users");
     
     // Verify token
     const resetToken = await db.collection("password_reset_tokens")
       .findOne({ token: token, expires_at: { $gt: new Date() } });
     
     if (!resetToken) {
       throw new Error("Invalid or expired token");
     }
     
     // Hash new password
     const hashedPassword = await context.functions.execute("hashPassword", newPassword);
     
     // Update user password
     await users.updateOne(
       { email: resetToken.email },
       { $set: { hashed_password: hashedPassword } }
     );
     
     // Delete used token
     await db.collection("password_reset_tokens").deleteOne({ token: token });
     
     return { success: true };
   };
   ```

3. **Create the app link:**
   ```
   https://cloud.mongodb.com/v2/YOUR_CLUSTER_ID/app/YOUR_APP_ID
   ```

### **Method 3: Custom Web Interface in Atlas**

1. **Create a simple HTML page:**
   ```html
   <!DOCTYPE html>
   <html>
   <head>
       <title>Password Reset - NetAegis</title>
       <style>
           body { font-family: Arial, sans-serif; padding: 20px; }
           .container { max-width: 500px; margin: 0 auto; }
           .form-group { margin-bottom: 15px; }
           input { width: 100%; padding: 10px; margin-top: 5px; }
           button { background: #b71c1c; color: white; padding: 10px 20px; border: none; }
       </style>
   </head>
   <body>
       <div class="container">
           <h1>🔐 Reset Password</h1>
           <form id="resetForm">
               <div class="form-group">
                   <label>New Password:</label>
                   <input type="password" id="password" required>
               </div>
               <div class="form-group">
                   <label>Confirm Password:</label>
                   <input type="password" id="confirmPassword" required>
               </div>
               <button type="submit">Reset Password</button>
           </form>
           <div id="message"></div>
       </div>
       
       <script>
           document.getElementById('resetForm').addEventListener('submit', async function(e) {
               e.preventDefault();
               const password = document.getElementById('password').value;
               const confirmPassword = document.getElementById('confirmPassword').value;
               
               if (password !== confirmPassword) {
                   document.getElementById('message').innerHTML = 'Passwords do not match!';
                   return;
               }
               
               // Call Atlas App Services function
               try {
                   const result = await context.functions.execute("resetPassword", 
                       new URLSearchParams(window.location.search).get('token'), 
                       password
                   );
                   document.getElementById('message').innerHTML = 'Password reset successful!';
               } catch (error) {
                   document.getElementById('message').innerHTML = 'Error: ' + error.message;
               }
           });
       </script>
   </body>
   </html>
   ```

2. **Host it in Atlas:**
   - Upload the HTML to Atlas App Services
   - Create a public endpoint
   - Share the URL in emails

## 🔧 Setup Instructions

### **Step 1: Configure Atlas Permissions**

1. **Go to MongoDB Atlas:**
   ```
   https://cloud.mongodb.com
   ```

2. **Set up user access:**
   - Database Access > Add New Database User
   - Create users with appropriate permissions
   - For password reset: Read/Write access to `users` collection

3. **Network Access:**
   - Allow access from anywhere (0.0.0.0/0) for testing
   - Or restrict to specific IP addresses for production

### **Step 2: Create Email Templates**

1. **Update your email service:**
   ```python
   # In your email service
   def send_atlas_reset_email(user_email, user_name, token):
       atlas_link = f"https://cloud.mongodb.com/v2/YOUR_CLUSTER_ID/explorer/YOUR_DATABASE/users/find"
       
       email_content = f"""
       🔐 NetAegis Password Reset
       
       Dear {user_name},
       
       Click this link to reset your password directly in MongoDB Atlas:
       {atlas_link}
       
       Or follow these steps:
       1. Go to https://cloud.mongodb.com
       2. Log into your Atlas account
       3. Navigate to Database > Collections > users
       4. Find your document by email: {user_email}
       5. Update the 'hashed_password' field
       
       Token: {token}
       Email: {user_email}
       
       This link expires in 1 hour.
       """
       
       # Send email with this content
   ```

### **Step 3: Test the Flow**

1. **Generate a test email:**
   ```bash
   python direct_atlas_reset.py
   ```

2. **Test the Atlas link:**
   - Click the generated link
   - Verify it opens MongoDB Atlas
   - Test password update functionality

3. **Verify security:**
   - Check that tokens expire properly
   - Ensure only authorized users can access Atlas
   - Log all password change activities

## 🔒 Security Considerations

### **1. Access Control**
- Only give Atlas access to trusted users
- Use read-only access for regular users
- Implement proper authentication

### **2. Token Security**
- Generate secure, random tokens
- Set short expiration times (1 hour)
- Delete tokens after use

### **3. Password Hashing**
- Never store plain text passwords
- Use bcrypt or similar hashing
- Update hashing in Atlas App Services

### **4. Monitoring**
- Log all password change activities
- Monitor for suspicious access patterns
- Set up alerts for failed attempts

## 📱 User Experience

### **Desktop Instructions:**
1. Click the Atlas link in email
2. Log into MongoDB Atlas
3. Navigate to your user document
4. Update the password field
5. Save changes

### **Mobile Instructions:**
1. Open email on mobile device
2. Click Atlas link (works on mobile)
3. Log into Atlas mobile interface
4. Follow same steps as desktop

### **Alternative Instructions:**
If Atlas link doesn't work:
1. Go to https://cloud.mongodb.com manually
2. Log into your account
3. Navigate to Database > Collections > users
4. Find your document by email
5. Update the password field

## 🎯 Benefits

- ✅ **No backend server required**
- ✅ **Direct MongoDB Atlas integration**
- ✅ **Works with any email client**
- ✅ **No hosting needed**
- ✅ **Secure token-based authentication**
- ✅ **Professional user experience**
- ✅ **Mobile-friendly**
- ✅ **Real-time database updates**

## 🚀 Quick Start

1. **Configure Atlas permissions**
2. **Update email templates with Atlas links**
3. **Test the complete flow**
4. **Monitor and maintain**

This approach gives you a **complete password reset solution** that works entirely through MongoDB Atlas without requiring any backend server or hosting! 
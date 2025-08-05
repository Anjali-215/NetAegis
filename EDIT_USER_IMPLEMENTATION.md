# Edit User Functionality Implementation

## Overview
This document describes the implementation of the edit user functionality in the NetAegis admin dashboard. The feature allows administrators to update user details including name, email, company, and password. **Important: User roles are preserved and cannot be changed when editing existing users.**

## Backend Implementation

### 1. UserService Update Method
**File:** `backend/services/user_service.py`

Added `update_user` method that:
- Validates user exists before updating
- Checks for email uniqueness (excluding current user)
- Updates name, email, company fields
- **Preserves existing role** (role field is not updated)
- Optionally updates password (only if provided)
- Returns updated user data

```python
async def update_user(self, user_id: str, update_data: dict) -> Optional[UserResponse]:
    """Update user details including name, email, company, and password (role preserved)"""
    # Implementation details...
```

### 2. API Endpoints
**File:** `backend/api/auth.py`

#### Update User Endpoint
Added PUT endpoint `/auth/admin/users/{user_id}` that:
- Requires admin authentication
- Validates user exists
- **Preserves existing user roles** (role field excluded from updates)
- Handles validation errors
- Returns updated user response

#### Password Reset Endpoint
Added POST endpoint `/auth/admin/users/{user_id}/reset-password` that:
- Requires admin authentication
- Generates secure reset token
- Sends password reset email to user
- Stores reset token in database
- Returns confirmation message

```python
@router.post("/admin/users/{user_id}/reset-password")
async def admin_reset_user_password(
    user_id: str,
    database: AsyncIOMotorDatabase = Depends(get_db),
    admin_user: UserResponse = Depends(require_admin)
):
    """Admin endpoint to trigger password reset for any user"""
    # Implementation details...
```

## Frontend Implementation

### 1. API Service
**File:** `frontend/src/services/api.js`

Added API functions:
```javascript
export const adminUpdateUser = async (userId, userData, token) => {
  const response = await api.put(`/auth/admin/users/${userId}`, userData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const adminResetUserPassword = async (userId, token) => {
  const response = await api.post(`/auth/admin/users/${userId}/reset-password`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
```

### 2. UserManagement Component
**File:** `frontend/src/pages/admin/UserManagement.jsx`

#### Key Changes:

1. **Import Update Functions:**
   ```javascript
   import { adminAddUser, adminListUsers, adminDeleteUser, adminUpdateUser, adminResetUserPassword } from '../../services/api';
   ```

2. **Enhanced handleOpenDialog:**
   - Populates form with existing user data when editing
   - Clears password field for security
   - Sets editing state

3. **Updated handleSubmit:**
   - Handles both add and edit operations
   - **Excludes role field when updating** (preserves existing role)
   - Only includes password in update if provided
   - Shows appropriate success messages

4. **Implemented handleResetPassword:**
   - Calls admin password reset API
   - Shows success/error feedback
   - Refreshes user list after reset

5. **Improved Validation:**
   - Password only required for new users
   - Optional for editing existing users

6. **Enhanced UI:**
   - Dynamic dialog title ("Edit User" vs "Add New Regular User")
   - Dynamic button text ("Update" vs "Add")
   - Password field placeholder for edit mode
   - **Role field disabled when editing** with explanatory text
   - **Yellow shield button** for password reset functionality

## Features

### ✅ Implemented Features

1. **Edit User Details:**
   - Name
   - Email (with uniqueness validation)
   - Company
   - **Role (preserved - cannot be changed)**
   - Password (optional when editing)

2. **Password Reset Functionality:**
   - **Yellow shield button** in user management
   - Generates secure reset tokens
   - Sends professional HTML emails
   - Includes both frontend and direct database reset links
   - 1-hour token expiration for security

3. **Security Features:**
   - Admin-only access
   - Password field cleared when editing
   - Email uniqueness validation
   - **Role preservation** (existing roles maintained)
   - Secure token generation and storage

4. **User Experience:**
   - Pre-populated form fields
   - Clear visual indicators (edit vs add)
   - Helpful placeholder text
   - Success/error feedback
   - **Disabled role field with explanation when editing**
   - **Professional email templates**

5. **Validation:**
   - Required field validation
   - Email format validation
   - Password optional for edits

## Email Integration

### Email Service
**File:** `backend/utils/email_service.py`

Comprehensive email service with:
- Professional HTML templates
- Password reset emails
- Security alert emails
- Threat notification emails
- CSV analysis summary emails

### Email Configuration
**File:** `backend/config.py`

Configurable email settings:
- SMTP server configuration
- Gmail/Outlook/Yahoo support
- Environment variable support
- Secure credential management

### Email Setup Guide
**File:** `EMAIL_SETUP_GUIDE.md`

Complete setup instructions:
- Gmail App Password setup
- Environment configuration
- Testing procedures
- Troubleshooting guide

## Usage

### For Administrators:

1. **Access User Management:**
   - Navigate to Admin Dashboard
   - Click on "User Management"

2. **Edit a User:**
   - Click the edit (pencil) icon next to any user
   - Modify the desired fields (name, email, company, password)
   - **Note: Role field will be disabled and cannot be changed**
   - Leave password blank to keep current password
   - Click "Update" to save changes

3. **Reset User Password:**
   - Click the yellow shield icon next to any user
   - System will send password reset email to user
   - User receives professional HTML email with reset links
   - User can reset password via email links

4. **Add a New User:**
   - Click "Add User" button
   - Fill in all required fields
   - Click "Add" to create user

### API Endpoints:

- **GET** `/auth/admin/users` - List all users
- **POST** `/auth/admin/add_user` - Add new user
- **PUT** `/auth/admin/users/{user_id}` - Update existing user (role preserved)
- **DELETE** `/auth/admin/users/{user_id}` - Delete user
- **POST** `/auth/admin/users/{user_id}/reset-password` - Reset user password

## Role Management

### Role Preservation Policy:
- **Existing users**: Roles are preserved and cannot be changed through the edit interface
- **New users**: Always created with "user" role regardless of form selection
- **Admin users**: Cannot be deleted or have their role changed

### Why This Design:
1. **Security**: Prevents accidental role escalation
2. **Audit Trail**: Maintains clear role history
3. **Compliance**: Ensures proper access control
4. **Simplicity**: Reduces complexity in role management

## Email Functionality

### Password Reset Flow:
1. Admin clicks yellow shield icon
2. System generates secure reset token
3. Professional HTML email sent to user
4. Email includes both frontend and direct database reset links
5. User clicks link to reset password
6. Password updated in MongoDB

### Email Features:
- **Professional HTML templates**
- **Responsive design**
- **Security warnings and instructions**
- **Multiple reset link options**
- **1-hour token expiration**
- **Comprehensive error handling**

## Testing

### Test Scripts
**File:** `test_edit_user.py` - Edit user functionality test
**File:** `test_email_functionality.py` - Email service test

### Manual Testing Steps:

1. **Setup Email Configuration:**
   ```bash
   cd backend
   # Create .env file with email settings
   python test_email_functionality.py
   ```

2. **Start Servers:**
   ```bash
   cd backend && python main.py
   cd frontend && npm run dev
   ```

3. **Test Password Reset:**
   - Login as admin
   - Navigate to User Management
   - Click yellow shield icon on any user
   - Check user's email for reset link
   - Test reset functionality

4. **Test Edit User:**
   - Click edit icon on any user
   - Verify role field is disabled
   - Modify other details and save
   - Verify changes are saved

## Database Impact

The implementation updates the MongoDB `users` collection with:
- Modified user documents
- Updated email addresses
- New password hashes (if changed)
- **Existing role assignments preserved**
- Password reset tokens (temporary)

## Security Considerations

1. **Authentication:** All endpoints require valid admin token
2. **Authorization:** Only admin users can modify user data
3. **Password Security:** Passwords are hashed before storage
4. **Email Validation:** Prevents duplicate email addresses
5. **Role Protection:** **Existing roles are preserved and cannot be changed**
6. **Token Security:** Reset tokens expire in 1 hour
7. **Email Security:** Professional templates with security warnings

## Error Handling

The implementation includes comprehensive error handling for:
- Invalid user IDs
- Duplicate email addresses
- Missing required fields
- Database connection issues
- Authentication failures
- Email delivery failures
- Token expiration

## Future Enhancements

Potential improvements:
1. Bulk user operations
2. User activity logging
3. Email notifications for changes
4. Advanced role management (separate interface)
5. User profile pictures
6. Audit trail for changes
7. Email delivery tracking
8. Rate limiting for password resets

## Files Modified

1. `backend/services/user_service.py` - Added update_user method
2. `backend/api/auth.py` - Added PUT and POST endpoints
3. `frontend/src/services/api.js` - Added adminUpdateUser and adminResetUserPassword functions
4. `frontend/src/pages/admin/UserManagement.jsx` - Enhanced edit and reset functionality
5. `test_edit_user.py` - Edit user test script
6. `test_email_functionality.py` - Email service test script
7. `EMAIL_SETUP_GUIDE.md` - Email configuration guide

## Conclusion

The edit user functionality is now fully implemented with **role preservation** and **password reset capabilities**. Administrators can efficiently manage user accounts through the web interface, with all changes properly validated and stored in the MongoDB database. **User roles are maintained and cannot be accidentally changed during the edit process.** The yellow shield button now sends professional password reset emails to users, enabling secure password management. 
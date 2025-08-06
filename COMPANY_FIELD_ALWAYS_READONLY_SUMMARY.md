# Company Field Always Read-Only Implementation

## Overview
Updated the company field in the admin user management to be **always read-only/uneditable**, both when adding new users and when editing existing users. This ensures that company assignments cannot be changed through the admin interface.

## Changes Made

### Frontend Changes (`frontend/src/pages/admin/UserManagement.jsx`)

#### 1. Company Field Behavior
- **Always Disabled**: Company field is now disabled for both adding new users and editing existing users
- **Auto-Populated**: Company field is automatically set to admin's company when adding new users
- **Read-Only Display**: Company field shows current company when editing but cannot be changed

#### 2. Form Logic Updates
- **Validation Removed**: No company validation since field is always read-only
- **Update Payload**: Company is excluded from update payload when editing users
- **Helper Text**: Shows "Company cannot be changed" for all cases

#### 3. User Interface Updates
- **Dialog Notes**: Added note for editing users that company cannot be changed
- **Visual Consistency**: Company field appears grayed out in all scenarios
- **Clear Messaging**: Consistent helper text explaining the restriction

## Behavior Now

### When Adding New User:
- ✅ Company field is **disabled** (grayed out)
- ✅ Company field is **auto-populated** with admin's company
- ✅ Helper text: "Company cannot be changed"
- ✅ No validation errors for company field

### When Editing Existing User:
- ✅ Company field is **disabled** (grayed out)
- ✅ Company field shows current user's company (read-only)
- ✅ Admin **cannot modify** the company
- ✅ Helper text: "Company cannot be changed"
- ✅ Note: "Company and role cannot be changed when editing users"

## Code Changes

### 1. Company Field Component
```jsx
<TextField
  fullWidth
  label="Company"
  value={formData.company}
  onChange={handleChange}
  name="company"
  disabled={true} // Always disabled - company cannot be changed
  helperText="Company cannot be changed"
/>
```

### 2. Validation Logic
```jsx
const validateForm = () => {
  const errors = {};
  if (!formData.name.trim()) errors.name = 'Name is required';
  if (!formData.email.trim()) errors.email = 'Email is required';
  
  // Password validation for new users only
  if (!editingUser && !formData.password.trim()) {
    errors.password = 'Password is required';
  }
  
  setFormErrors(errors);
  return Object.keys(errors).length === 0;
};
```

### 3. Update Payload
```jsx
if (editingUser) {
  // Update existing user - preserve original role and company
  const updatePayload = {
    name: formData.name,
    email: formData.email
    // Don't include company or role to preserve existing values
  };
}
```

### 4. Dialog Notes
```jsx
{!editingUser && (
  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
    Note: You can only create regular users. Admin users can only be created through the signup process. Company is automatically set to match your company.
  </Typography>
)}
{editingUser && (
  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
    Note: Company and role cannot be changed when editing users.
  </Typography>
)}
```

## Security Benefits

1. **Data Integrity**: Prevents accidental company changes
2. **Policy Enforcement**: Ensures users stay within their assigned company
3. **Audit Trail**: Company changes can only be made through direct database access
4. **Consistent UX**: Clear visual indication that company is not editable

## User Experience

### Visual Indicators:
- **Disabled Field**: Company field appears grayed out in all scenarios
- **Helper Text**: Clear explanation that company cannot be changed
- **Dialog Notes**: Context-specific notes for add vs edit scenarios

### Workflow:
1. **Adding User**: Company auto-filled and disabled
2. **Editing User**: Company displayed but disabled
3. **Form Submission**: Company preserved as-is in database

## Backend Integration

The backend already enforces company restrictions:
- `POST /auth/admin/add_user` forces company to match admin's company
- `PUT /auth/admin/users/{user_id}` validates company matches admin's company
- Frontend changes complement this backend security

## Files Modified

1. `frontend/src/pages/admin/UserManagement.jsx` - Main form logic and UI updates
2. `COMPANY_FIELD_READONLY_SUMMARY.md` - Updated documentation

## Testing

To test the implementation:
1. Login as admin
2. Go to User Management
3. Click "Add New User" - verify company field is disabled and auto-populated
4. Click "Edit" on existing user - verify company field is disabled and shows current company
5. Try to modify company field - should be impossible 
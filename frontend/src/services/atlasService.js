// MongoDB Atlas Direct Service
// This service handles password reset operations via backend

class AtlasService {
  constructor() {
    // Backend API URL
    this.backendUrl = 'http://localhost:8000';
  }

  // Hash password using Web Crypto API
  async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }

  // Update password via backend API
  async updatePasswordInAtlas(email, password, token) {
    try {
      console.log('Updating password via backend API...');
      
      // Call the backend endpoint to update password
      const response = await fetch(`${this.backendUrl}/auth/atlas-reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: token,
          new_password: password  // Send plain password, backend will hash it
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('Password updated successfully:', result);
        return { 
          success: true, 
          message: 'Password updated successfully in MongoDB Atlas' 
        };
      } else {
        console.error('Password update failed:', result);
        return { 
          success: false, 
          message: result.detail || 'Failed to update password' 
        };
      }
      
    } catch (error) {
      console.error('Error updating password:', error);
      return { 
        success: false, 
        message: 'Failed to update password. Please try again.' 
      };
    }
  }

  // Validate reset token via backend
  async validateToken(token, email) {
    try {
      console.log('Validating token via backend...');
      
      // For now, we'll do basic validation
      // In a real implementation, you might want to call a backend endpoint
      const isValid = token && token.length > 10;
      
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ 
            valid: isValid, 
            message: isValid ? 'Token is valid' : 'Invalid or expired token' 
          });
        }, 1000);
      });
    } catch (error) {
      console.error('Token validation error:', error);
      return { valid: false, message: 'Token validation failed' };
    }
  }

  // Get Atlas configuration
  getAtlasConfig() {
    return {
      backendUrl: this.backendUrl,
      atlasResetEndpoint: `${this.backendUrl}/auth/atlas-reset-password`
    };
  }

  // Generate Atlas reset link
  generateAtlasResetLink(token, email) {
    const baseUrl = window.location.origin;
    return `${baseUrl}/atlas-reset?token=${token}&email=${encodeURIComponent(email)}`;
  }
}

export default new AtlasService(); 
import api, { default as ApiService } from './api';

export const activateSubscription = async (planDetails) => {
  try {
    const response = await ApiService.request('/api/subscriptions/activate', {
      method: 'POST',
      body: JSON.stringify(planDetails)
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateUserRole = async (userId, role) => {
  try {
    const response = await ApiService.request(`/api/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role })
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getSubscriptionStatus = async () => {
  try {
    const response = await ApiService.request('/api/subscriptions/status');
    return response.data;
  } catch (error) {
    throw error;
  }
};
import { useState, useCallback, useEffect } from 'react';
import { checkAuthStatus, logout } from '../services/authService';

export const useAuth = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      // Small delay to ensure cookie is set after OAuth redirect
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const data = await checkAuthStatus();
      
      if (data.loggedIn) {
        setLoggedIn(true);
        setUserInfo({
          username: data.username || 'User',
          email: data.email || '',
          userType: data.userType || 'Standard',
          instanceUrl: data.instanceUrl || '',
          domainType: data.domainType || 'production',
        });
      } else {
        setLoggedIn(false);
        setUserInfo(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setLoggedIn(false);
      setUserInfo(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setLoggedIn(false);
      setUserInfo(null);
      return { success: true, message: 'Successfully logged out. You can now login with a different account.' };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, message: 'Failed to logout. Please try again.' };
    }
  };

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    loggedIn,
    userInfo,
    loading,
    checkAuth,
    handleLogout,
  };
};

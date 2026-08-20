import { useState, useCallback, useEffect } from 'react';
import { checkAuthStatus, logout } from '../services/authService';

export const useAuth = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
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
    } catch {
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
      return { success: true, message: 'Successfully logged out.' };
    } catch {
      return { success: false, message: 'Failed to logout. Please try again.' };
    }
  };

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return { loggedIn, userInfo, loading, checkAuth, handleLogout };
};

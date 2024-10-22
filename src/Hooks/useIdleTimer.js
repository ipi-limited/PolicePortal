import { useEffect } from 'react';
import { useAuth } from './AuthContext'
import { useNavigate } from 'react-router-dom';

const useIdleTimer = (timeoutDuration) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    let timeoutId;

    const handleActivity = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        signOut();
        navigate('/');
      }, timeoutDuration);
    };

    // Listen for user activity
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('click', handleActivity);

    // Set initial timeout
    handleActivity();

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('click', handleActivity);
    };
  }, [signOut, timeoutDuration]);
};

export default useIdleTimer;

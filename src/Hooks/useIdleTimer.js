import { useEffect } from 'react';
import { signOut } from 'aws-amplify/auth';
import { useNavigate } from 'react-router-dom';

const useIdleTimer = (timeoutDuration) => {
  const navigate = useNavigate();

  useEffect(() => {
    let timeoutId;

    const handleActivity = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        try {
          await signOut();
          navigate('/'); 
        } catch (error) {
          console.error('Error signing out:', error);
        }
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
  }, [timeoutDuration, navigate]); 
};

export default useIdleTimer;

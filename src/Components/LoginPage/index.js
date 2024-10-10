import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Hooks/AuthContext'; 
import Header from '../../Header';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = useAuth();  
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signIn(username, password);
      navigate('/Dashboard');
    } catch (error) {
      console.error('Login failed', error);
      alert('Login failed. Please check your credentials.');
    }
  };

  return (
    <div>
            <Header />
        <div className="container">      
            <div className='text-center mt-3'>
                <h2 className="text-center text-black">Login Page</h2>
            </div>
            <div className="d-flex flex-column align-items-center mt-4">
            <div className="mb-3 w-49">
                <input type="text" id="username" name="username"placeholder='Enter UserName' className="form-control" value={username} onChange={e => setUsername(e.target.value)} />
            </div>

            <div className="mb-3 w-49">
                <input type="password" id="password" name="password"placeholder='Enter Password' className="form-control" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={handleLogin}>Login</button>
            </div>
        <div>
    </div>
    </div>
    </div>
  );
};

export default Login;

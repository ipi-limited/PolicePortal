import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Hooks/AuthContext'; 
import Header from '../../Header';
import './Login.css';

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
    <div className="login-page">
      <Header />
      <div className="login-container">
        <div className="left-side">
          {/* Add your image here */}
          <div className="curved-side">
            <img src="/images/Police.png" alt="Police" className="police-image" />
          </div>
        </div>
        <div className="right-side">
          <div className='text-center mt-3'>
            <h2 className="text-center text-black">Police Login</h2>
          </div>
          <div className="d-flex flex-column align-items-center mt-4">
            <div className="login-form w-75">
              <input 
                type="text" 
                id="username" 
                name="username"
                placeholder='Enter Username' 
                className="form-control mb-3" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
              />

              <input 
                type="password" 
                id="password" 
                name="password"
                placeholder='Enter Password' 
                className="form-control mb-3" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
              />

              <button className="btn btn-primary w-100" onClick={handleLogin}>Login</button>
            </div>
          </div>
        </div>
      </div>
    </div>


  );
};

export default Login;

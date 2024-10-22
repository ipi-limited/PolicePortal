// Header.js
import React from 'react';
import { Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './Header.css'
import { useAuth } from './Hooks/AuthContext';
import { FaSignOutAlt } from 'react-icons/fa';


const Header = ({onHomeClick}) => {
  const navigate = useNavigate(); 
  const { isAuthenticated, signOut } = useAuth();  
  console.log('Auth',isAuthenticated)

  const handleSignOut = () => {
    signOut();  
    navigate('/'); 
  };


  return (
    <header className="App-header text-center">
      <div className="header-content d-flex justify-content-center align-items-center flex-column w-100">
        <img
          src="https://www.roadangelgroup.com/cdn/shop/files/ralogo_2x-pad_340x.png?v=1698325665"
          alt="Logo"
          className="logo"
        />
        <h1 className="mt-3">Police Portal</h1>
      {/* Add Tabs inside the Header */}
      {isAuthenticated && (
        <div>
      <Nav variant="tabs" className="justify-content-center mt-1 header-tabs">
      <Nav.Item>
          <Nav.Link onClick={() => navigate('/')}>Home</Nav.Link> {/* Home Tab */}
        </Nav.Item>
        <Nav.Item>
          <Nav.Link onClick={() => navigate('/StreamVideo')}>Video Streaming</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link onClick={() => navigate('/BucketAccess')}>Cloud Storage</Nav.Link> 
        </Nav.Item>
        <Nav.Item>
          <Nav.Link onClick={() => navigate('/DbTable')}>DataBase</Nav.Link> 
        </Nav.Item>
      </Nav>
      {/* Sign out icon in the top-right corner */}
      <div className="signout-icon" onClick={handleSignOut}>
              <FaSignOutAlt size="60px" color='white'/>
            </div>
        </div>
      )}
      </div>    
    </header>
   
  );
};

export default Header;

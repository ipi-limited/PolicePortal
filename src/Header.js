// Header.js
import React from 'react';
import { Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './Header.css';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { FaSignOutAlt } from 'react-icons/fa';

const Header = () => {
  const navigate = useNavigate(); 
  const { user, signOut } = useAuthenticator((context) => [context.user]);
  
  return (
    <header className="App-header">
      <div className="header-content d-flex justify-content-between align-items-center px-3">
        {/* Logo and Title */}
        <div className="logo-and-heading">
          <img
            src="https://www.roadangelgroup.com/cdn/shop/files/ralogo_2x-pad_340x.png?v=1698325665"
            alt="Logo"
            className="logo"
          />
          <h1 className="mt-3" style={{ color: 'white' }}>Police Portal</h1>
        </div>

        <div className="signout-icon" onClick={() => { signOut(); navigate('/'); }}>
          <FaSignOutAlt size="40px" color="white" />
        </div>
      </div>

      {/* Navigation Tabs */}
      {user && (
        <Nav variant="tabs" className="justify-content-center mt-1 header-tabs">
          <Nav.Item>
            <Nav.Link onClick={() => navigate('/')}>Home</Nav.Link>
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
      )}
    </header>
  );
};

export default Header;

// WelcomePage.js
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from '../../Header';

const Dashboard = ({ onStart }) => {
  return (
    <div>
      <Header />
        <img 
          src="/images/map.jpg"
          alt="Welcome Image" 
          className="img-fluid my-4"
          style={{ width: '100%', }}
        />
      </div>
  );
};

export default Dashboard;

// WelcomePage.js
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from '../../Header';

const Dashboard = ({ onStart }) => {
  return (
    <div>
        <Header />
    <div className="container text-center mt-5">
      <h1 className="display-4">Welcome to the Police Portal</h1>
      <p className="lead">Your dashboard to access commands and manage data.</p>
      <button className="btn btn-primary btn-lg" onClick={onStart}>
        Get Started
      </button>
    </div>
    </div>
  );
};

export default Dashboard;

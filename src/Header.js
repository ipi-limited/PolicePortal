// Header.js
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const Header = () => {
    return (
        <header className="App-header text-center">
            <div className="header-content d-flex justify-content-between align-items-center">
                <img 
                    src="https://www.roadangelgroup.com/cdn/shop/files/ralogo_2x-pad_340x.png?v=1698325665" 
                    alt="Logo" 
                    className="logo" 
                />
                <h1>Police Portal</h1>
            </div>
        </header>
    );
};

export default Header
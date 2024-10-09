import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Header from './Header';
import appRoutes from './Routes/appRoutes';

function App() {

  const [isStarted, setIsStarted] = useState(false); 

  const handleStart = () => {
    setIsStarted(true);
  };


  return (
    <div className="App">
       <Header /> 
       {/* <appRoutes />  */}
    </div>
  );
}

export default App;

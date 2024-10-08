import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Header from './Header'

function App() {
  const [command, setCommand] = useState('');
  const [response, setResponse] = useState('');


  const sendCommand = async () => {
    const apiUrl = 'https://v2hvllmzbk.execute-api.eu-west-2.amazonaws.com/dev/send-command';

    const payload = {
      command: command
    };

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        setResponse(`Command '${command}' sent successfully}`);
        setTimeout(() => {
          window.location.href = '/streamVideo';
      }, 2000);
      } else {
        setResponse(`Error: ${data}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setResponse('Failed to send command');
    }
  };

  return (
    <div className="App">
        <Header />
      <div className="container">
        <div className="mb-3 text-input-container">
          <input
            type="text"
            className="form-control text-input"
            placeholder="Enter Command"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
          />
        </div>
        <div className='button-container'>
        <button className="btn btn-primary mt-3 " onClick={sendCommand}>
          Send Command
        </button>
        </div>
      </div>
      <div className="mt-4 text-center" >
        <p className='fw-bold'>{response}</p>
      </div>
    </div>

  );
}

export default App;

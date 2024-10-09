// SendCommand.js
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from '../../Header';

const SendCommand = () => {
  const [command, setCommand] = useState('start');
  const [response, setResponse] = useState('');
  const commandSent = localStorage.getItem('commandSent')


  useEffect(() => {
    // If command has already been sent, navigate to StreamVideo
    if (commandSent) {
      window.location.href = '/streamVideo';
    }
  }, [commandSent]); 

  console.log('commad',commandSent)
  const sendCommand = async () => {
    const apiUrl = 'https://v2hvllmzbk.execute-api.eu-west-2.amazonaws.com/dev/send-command';

    const payload = {
      command: command,
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
        setResponse(`Command '${command}' sent successfully`);
        localStorage.setItem('commandSent', 'true');
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
    <div>
        <Header />
    <div className="container">
      {/* <div className="mb-3 text-input-container">
        <input
          type="text"
          className="form-control text-input"
          placeholder="Enter Command"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
        />
      </div> */}
      {!commandSent && (
      <div className='button-container'>
        <button className="btn btn-primary mt-3" onClick={sendCommand}>
          Send Command
        </button>
      </div>
      )}
      <div className="mt-4 text-center">
        <p className="fw-bold">{response}</p>
      </div>
    </div>
    </div>
  );
};

export default SendCommand;

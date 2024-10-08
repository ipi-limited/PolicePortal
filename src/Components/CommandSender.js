import React, { useState } from 'react';
import './CommandSender.css';  // Import the CSS file

const CommandSender = () => {
  const [command, setCommand] = useState('');
  const [response, setResponse] = useState('');

  // Function to handle sending command
  const sendCommand = async () => {
    const apiUrl = 'https://v2hvllmzbk.execute-api.eu-west-2.amazonaws.com/dev/send-command'; // Replace with your API URL

    const payload = {
      command: command,
    };

    try {
      const apiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await apiResponse.json();
      if (apiResponse.ok) {
        setResponse(`Command '${command}' sent successfully: ${data.body}`);
      } else {
        setResponse(`Error: ${data}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setResponse('Failed to send command');
    }
  };

  return (
    <div className="command-sender-container">
      <h1 className="title">Send Command</h1>
      <div className="input-section">
        <select
          id="commandInput"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          className="command-select"
        >
          <option value="">--Select Command--</option>
          <option value="start">Start</option>
          <option value="stop">Stop</option>
          <option value="status">Status</option>
        </select>
        <button className="send-button" onClick={sendCommand}>Send Command</button>
      </div>
      <p className="response">{response}</p>
    </div>
  );
};

export default CommandSender;

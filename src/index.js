import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import AppRoutes from './Routes/appRoutes';
import { BrowserRouter } from 'react-router-dom'; 
import reportWebVitals from './reportWebVitals';
import { withAuthenticator } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports'
import {generateClient} from 'aws-amplify/api'
const root = ReactDOM.createRoot(document.getElementById('root'));

Amplify.configure(awsExports);
const AuthenticatedApp = withAuthenticator(AppRoutes); 
const client = generateClient();

root.render(
  <React.StrictMode>
      <BrowserRouter>
      <AuthenticatedApp />
      </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

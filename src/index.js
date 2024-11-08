import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import AppRoutes from './Routes/appRoutes';
import { BrowserRouter } from 'react-router-dom'; 
import reportWebVitals from './reportWebVitals';
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports'
import '@aws-amplify/ui-react/styles.css';
import apolloClient from './client'
import {generateClient } from 'aws-amplify/api'
import {ApolloProvider} from '@apollo/client'

Amplify.configure({
  ... awsExports,
  Analytics: {
    Kinesis: {
      region: 'eu-west-2', 
      bufferSize: 1000, 
      flushSize: 100, 
      flushInterval: 5000,
      resendLimit: 5
    }
  }
});

const client = generateClient();
const root = ReactDOM.createRoot(document.getElementById('root'));


root.render(
  <ApolloProvider client={apolloClient}>
  <React.StrictMode>
      <BrowserRouter>
      <AppRoutes />
      </BrowserRouter>
  </React.StrictMode>
  </ApolloProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

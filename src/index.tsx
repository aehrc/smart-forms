import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { oauth2 as SMART } from 'fhirclient';
import App from './App';
import ErrorPage from './ErrorPage';

const root = ReactDOM.createRoot(document.getElementById('root') as Element);

SMART.init({
  iss: 'https://launch.smarthealthit.org/v/r4/fhir',
  redirectUri: 'index.html',
  clientId: 'my_web_app',
  scope: 'launch/patient patient/*.read offline_access openid fhirUser'
}).then(
  (client) => {
    root.render(<App client={client} />);
  },
  (error) => {
    root.render(<ErrorPage error={error} />);
  }
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

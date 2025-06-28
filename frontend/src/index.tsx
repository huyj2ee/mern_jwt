import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/roboto';
import App from './components/App';
import './app.css';
import { store } from './app/store';
import { Provider } from 'react-redux';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
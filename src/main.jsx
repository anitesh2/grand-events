/**
 * Composition root: the only place where concrete implementations are wired
 * together (repository -> service -> UI). Swapping localStorage for another
 * store would only change this file.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { I18nProvider } from './i18n/I18nContext.jsx';
import { createLocalStorageEventRepository } from './repository/localStorageEventRepository.js';
import { createEventService } from './services/eventService.js';
import './styles.css';

const service = createEventService(createLocalStorageEventRepository());

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <I18nProvider>
      <App service={service} />
    </I18nProvider>
  </React.StrictMode>,
);

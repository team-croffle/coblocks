import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import '@langs/i18n';
import 'bootstrap/dist/css/bootstrap.min.css';
import './components/modules/i18n/i18n'; // i18n 초기화

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(<App />);

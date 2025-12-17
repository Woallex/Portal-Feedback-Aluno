import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import './App.css'; // ⬅️ NOVO: Importa seu CSS adaptado aqui
import { AuthProvider } from './contexts/AuthContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 3. Envolve o App com o Provedor de Autenticação */}
    <AuthProvider>
        <App />
    </AuthProvider>
  </React.StrictMode>,
);
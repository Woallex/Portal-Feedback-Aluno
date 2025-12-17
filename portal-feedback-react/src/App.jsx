// src/App.jsx (CORRIGIDO PARA O HEADER CONDICIONAL)
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Importe todos os componentes necessários
import LoginPage from './pages/LoginPage';
import CadastroPage from './pages/CadastroPage';
import HomePage from './pages/HomePage';
import CriarPublicacaoPage from './pages/CriarPublicacaoPage'; 
import FavoritosPage from './pages/FavoritosPage'; 
import Header from './components/Header'; // O componente que você quer remover do login

// ✅ NOVO COMPONENTE: Layout Protegido (inclui o Header)
// Este componente decide se renderiza o Header e verifica o login.
function ProtectedLayout({ element }) {
    const { isLoggedIn } = useAuth();
    
    // Se não estiver logado, redireciona para o login
    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }
    
    // Se estiver logado, renderiza o Header e o elemento (página)
    return (
        <>
            <Header /> {/* ⬅️ O Header é renderizado APENAS AQUI */}
            {element}
        </>
    );
}

function App() {
    return (
        <Router> 
            
            <Routes>
                {/* 1. Rotas Públicas: O elemento renderizado é apenas a página */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/cadastro" element={<CadastroPage />} />
                
                {/* 2. Rotas Protegidas: O elemento renderizado é o ProtectedLayout, 
                       que por sua vez renderiza o Header e a Página (element) */}
                <Route path="/" element={<ProtectedLayout element={<HomePage />} />} />
                <Route path="/publicar" element={<ProtectedLayout element={<CriarPublicacaoPage />} />} />
                <Route path="/favoritos" element={<ProtectedLayout element={<FavoritosPage />} />} />
                
                {/* Rota 404 */}
                <Route path="*" element={<h1 className="text-center mt-5">404: Página não encontrada</h1>} />
            </Routes>
        </Router>
    );
}

export default App;
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Header from './components/Header';
import { useAuth } from './contexts/AuthContext';
import CadastroPage from './pages/CadastroPage';
import CriarPublicacaoPage from './pages/CriarPublicacaoPage';
import FavoritosPage from './pages/FavoritosPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';

function ProtectedLayout({ element }) {
    const { isLoggedIn } = useAuth();

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    return (
        <>
            <Header />
            {element}
        </>
    );
}

function App() {
    return (
        <Router>

            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/cadastro" element={<CadastroPage />} />
                <Route path="/" element={<ProtectedLayout element={<HomePage />} />} />
                <Route path="/publicar" element={<CriarPublicacaoPage />} />
                <Route path="/favoritos" element={<ProtectedLayout element={<FavoritosPage />} />} />
                <Route path="*" element={<h1 className="text-center mt-5">404: Página não encontrada</h1>} />
            </Routes>
        </Router>
    );
}

export default App;
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Header from './components/Header';
import { useAuth } from './contexts/AuthContext';
import AdminPage from './pages/AdminPage';
import CadastroPage from './pages/CadastroPage';
import CriarPublicacaoPage from './pages/CriarPublicacaoPage';
import FavoritesPage from './pages/FavoritosPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import UserTypeSelectionPage from './pages/InicioPage';

function ProtectedLayout({ element }) {
    const { isLoggedIn } = useAuth();

    if (!isLoggedIn) {
        return <Navigate to="/iniciopage" replace />;
    }

    return (
        <>
            <Header />
            {element}
        </>
    );
}

function ProtectedAdminRoute({ element }) {
    const { isLoggedIn } = useAuth();
    const userType = localStorage.getItem('userType');

    if (!isLoggedIn || userType !== 'admin') {
        return <Navigate to="/iniciopage" replace />;
    }

    return element;
}

function App() {
    return (
        <Router>

            <Routes>
                <Route path="/iniciopage" element={<UserTypeSelectionPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/cadastro" element={<CadastroPage />} />
                <Route path="/admin" element={<ProtectedAdminRoute element={<AdminPage />} />} />
                <Route path="/" element={<ProtectedLayout element={<HomePage />} />} />
                <Route path="/publicar" element={<CriarPublicacaoPage />} />
                <Route path="/favorites" element={<ProtectedLayout element={<FavoritesPage />} />} />
                <Route path="*" element={<h1 className="text-center mt-5">404: Página não encontrada</h1>} />
            </Routes>   
        </Router>
    );
}

export default App;
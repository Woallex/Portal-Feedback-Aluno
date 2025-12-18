import { Nav } from 'react-bootstrap'; // Requisito 2: React Bootstrap

// Lista de Categorias da sua API/JSON
const CATEGORIAS = [
    "Infraestrutura",
    "Alimentação",
    "Transporte",
    "Limpeza",
    "TI/Portais",
    "Acadêmico",
    "Eventos/Calendário",
    "Segurança"
];

// O componente recebe a categoria ativa e uma função para mudar a categoria
function NavCategorias({ categoriaAtiva, onCategoriaChange }) {
    return (
        <Nav className="justify-content-center flex-wrap gap-2 py-3 bg-light border-bottom">
            {/* Opção para mostrar todas as categorias */}
            <Nav.Link
                onClick={() => onCategoriaChange(null)}
                active={categoriaAtiva === null}
                className="categoria fw-bold"
            >
                Todas
            </Nav.Link>

            {/* Mapeia a lista de categorias */}
            {CATEGORIAS.map(cat => (
                <Nav.Link
                    key={cat}
                    onClick={() => onCategoriaChange(cat)}
                    active={categoriaAtiva === cat}
                    className="categoria fw-bold"
                >
                    {cat}
                </Nav.Link>
            ))}
        </Nav>
    );


}

export default NavCategorias;
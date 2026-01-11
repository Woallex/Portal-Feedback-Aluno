import { Nav } from 'react-bootstrap';

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

function NavCategorias({ categoriaAtiva, onCategoriaChange }) {
    return (
        <Nav className="justify-content-center flex-wrap gap-2 py-3 bg-light border-bottom">
            <Nav.Link
                onClick={() => onCategoriaChange(null)}
                active={categoriaAtiva === null}
                className="categoria fw-bold"
            >
                Todas
            </Nav.Link>

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
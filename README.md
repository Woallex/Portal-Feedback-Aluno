# Portal Feedback - IFCE

**Sistema de gestão de feedbacks** acadêmicas em desenvolvimento para o Instituto Federal do Ceará campo Crato. O projeto permite que alunos façam publicações categorizadase e gerenciem seus favoritos.

## 🚀 Características

-   * **Autenticação**: Sistema de login e cadastro de usuários com persistência em sessão.
-   * **Publicações**: Criação de reclamações com título, descrição, categoria e data.
-   * **Categorização**: Filtragem de publicações por categorias como Infraestrutura, TI, Acadêmico, etc..
-   * **Favoritos**: Opção para marcar/desmarcar publicações como favoritas em tempo real.
-   * **Interface Responsiva**: Layout moderno desenvolvido com React Bootstrap e ícones intuitivos.
-   * **Persistência de Dados**: Armazenamento em arquivos JSON no servidor Flask.

## 🛠️ Stack Tecnológico

### Frontend
-   * **ReactJS**: Biblioteca principal para construção da interface.
-   * **React Bootstrap**: Framework de componentes para estilização e layout.
-   * **React Router Dom**: Gerenciamento de rotas e navegação SPA.
-   * **React Icons**: Biblioteca de ícones (Font Awesome).
-   * **Vite**: Ferramenta de build e servidor de desenvolvimento.

### Backend
-   * **Python com Flask**: Servidor responsável pelas rotas de API e lógica da aplicação.
-   * **Flask-CORS**: Gerenciamento de permissões de acesso entre o React e a API.
-   * **JSON**: Utilizado como "banco de dados" para usuários e reclamações.

## 🔧 Como rodar o projeto

### 1. Preparar o Backend (API)
Navegue até a pasta `api` e execute o servidor Python:
```bash
cd api
python app.py
```

### 2. Iniciar o Frontend
```bash
Na raiz do projeto, instale as dependências e rode o Vite:
npm install
npm run dev
```

## ☁️ Deploy (Vercel)
```bash
O projeto está otimizado para deploy na Vercel:
-   As rotas de /api são mapeadas automaticamente para o backend Python através do arquivo vercel.json.
-   O frontend React é compilado e servido de forma otimizada pelo Vite.
```
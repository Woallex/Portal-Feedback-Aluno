# Portal Feedback - IFCE

Sistema de gestão de feedbacks acadêmicos em desenvolvimento para o Instituto Federal do Ceará campos Crato. O projeto permite que alunos façam puclicações categorizadas e gerenciem seus favoritos.

## 🚀 Características

* **Autenticação**: Sistema de login e cadastro de usuários com persistência em sessão.
* **Publicações**: Criação de reclamações com título, descrição, categoria.
* **Categorização**: Filtragem de publicações por categorias como Infraestrutura, TI, Acadêmico, etc..
* **Favoritos**: Opção para marcar/desmarcar publicações como favoritas em tempo real.
* **Interface Responsiva**: Layout institucional desenvolvido com React Bootstrap e ícones intuitivos.
* **Persistência de Dados**: Armazenamento em arquivos JSON no servidor Flask.

## 🛠️ Stack Tecnológico

### Frontend
* **ReactJS**: Biblioteca principal para construção da interface.
* **React Bootstrap**: Framework de componentes para estilização e layout.
* **React Router Dom**: Gerenciamento de rotas e navegação SPA.
* **React Icons**: Biblioteca de ícones (Font Awesome).
* **Vite**: Ferramenta de build e servidor de desenvolvimento.

### Backend
* **Python**: Linguagem de programação do servidor.
* **Flask**: Micro-framework para criação da API REST.
* **Flask-CORS**: Gerenciamento de permissões de acesso entre o React e a API.
* **JSON**: Utilizado como "banco de dados" para usuários e reclamações.
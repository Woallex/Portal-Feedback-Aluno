# Portal Feedback - IFCE

**Sistema de gestão de feedbacks** acadêmicas em desenvolvimento para o Instituto Federal do Ceará campo Crato. O projeto permite que alunos façam publicações categorizadase e gerenciem seus favoritos.

<div align="center">
<img width="1893" height="914" alt="image" src="https://github.com/user-attachments/assets/18dc3b29-f015-48b9-bf2a-1c00d682af0d" />
</div>

## 🚀 Características

* **Autenticação**: Sistema de login e cadastro de usuários com persistência em sessão.
* **Publicações**: Criação de reclamações com título, descrição, categoria e data.
* **Categorização**: Filtragem de publicações por categorias como Infraestrutura, TI, Acadêmico, etc..
* **Favoritos**: Opção para marcar/desmarcar publicações como favoritas em tempo real.
* **Interface Responsiva**: Layout moderno desenvolvido com React Bootstrap e ícones intuitivos.
* **Persistência de Dados**: Armazenamento em arquivos JSON no servidor Flask.

## 🛠️ Stack Tecnológico

### Frontend
* **ReactJS**: Biblioteca principal para construção da interface.
* **React Bootstrap**: Framework de componentes para estilização e layout.
* **React Router Dom**: Gerenciamento de rotas e navegação SPA.
* **React Icons**: Biblioteca de ícones (Font Awesome).
* **Vite**: Ferramenta de build e servidor de desenvolvimento.

### Backend
* **Python com Flask**: Servidor responsável pelas rotas de API e lógica da aplicação.
* **Flask-CORS**: Gerenciamento de permissões de acesso entre o React e a API.
* **JSON**: Utilizado como "banco de dados" para usuários e reclamações.

## ☁️ Deploy (Vercel)
```bash
https://portal-feedback-aluno.vercel.app/
Obs: Em ajustes...
```

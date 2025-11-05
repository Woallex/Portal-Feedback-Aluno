# Arquivo: C:\IFCE\PortalFeedback\docs_api.py
# Objetivo: Exibir a documentação da API Flask (MVP) — rotas, payloads de envio e exemplos de retorno (sucesso e falha).
# Uso: python docs_api.py

DOCUMENTACAO_API = r"""
================================================================================
API Flask — Portal de Reclamações (MVP)
================================================================================
Base URL (local): http://127.0.0.1:5000
Formato: JSON (Content-Type: application/json)
Sessão: baseada em cookie de sessão do Flask (login persiste até logout ou reinício)

Padrão de resposta de TODAS as rotas:
{
  "ok": true|false,
  "data": ... | null,
  "error": { "code": <int>, "message": "<pt-br>" } | null
}

Observações importantes:
- MVP simples, sem papéis/admin, sem status, sem comentários.
- Senhas armazenadas em texto puro (apenas para MVP).
- Todas as reclamações são públicas.
- Não há paginação; listar retorna tudo.
- Categorias não são validadas por lista fechada neste MVP (apenas não-vazias).
- IDs são inteiros incrementais persistidos nos arquivos JSON.
- Arquivos JSON:
  - usuarios.json -> [{"id", "login", "senha", "favoritos": [idsDeReclamacoes]}]
  - reclamacoes.json -> [{"id","titulo","corpo","categoria","data(dd/mm/aaaa)","autor(login)"}]

--------------------------------------------------------------------------------
TABELA RÁPIDA DE ROTAS
--------------------------------------------------------------------------------
Autenticação:
  POST   /login
  POST   /logout

Usuários:
  POST   /usuarios
  PUT    /usuarios/{id}
  DELETE /usuarios/{id}

Reclamações:
  POST   /reclamacoes
  GET    /reclamacoes
  GET    /reclamacoes/{id}
  PUT    /reclamacoes/{id}
  DELETE /reclamacoes/{id}
  GET    /reclamacoes2              (lista com flag "favorito" por userId)

Favoritos (do usuário logado):
  POST   /favoritos/{id}
  DELETE /favoritos/{id}
  GET    /favoritos

================================================================================
1) AUTENTICAÇÃO
================================================================================

1.1) POST /login
Descrição: Autentica o usuário. Se já houver outro usuário logado nesta sessão, retorna erro.
Headers: Content-Type: application/json
Body (exemplo):
{
  "login": "aluno1",
  "senha": "123"
}

Sucesso (200):
{
  "ok": true,
  "data": { "id": 1, "login": "aluno1" },
  "error": null
}

Falhas:
- 400 (falta login/senha):
  {
    "ok": false,
    "data": null,
    "error": { "code": 400, "message": "Login e senha são obrigatórios." }
  }

- 400 (já existe outro usuário logado nesta sessão):
  {
    "ok": false,
    "data": null,
    "error": { "code": 400, "message": "Já existe um usuário logado." }
  }

- 401 (credenciais inválidas):
  {
    "ok": false,
    "data": null,
    "error": { "code": 401, "message": "Login ou senha incorretos." }
  }

1.2) POST /logout
Descrição: Encerra a sessão atual.
Headers: (sem body)

Sucesso (200):
{
  "ok": true,
  "data": null,
  "error": null
}

Falha:
- 401 (sem usuário logado):
  {
    "ok": false,
    "data": null,
    "error": { "code": 401, "message": "Usuário não está logado." }
  }

================================================================================
2) USUÁRIOS
================================================================================

2.1) POST /usuarios
Descrição: Cria um novo usuário (login único; senha em texto puro).
Headers: Content-Type: application/json
Body (exemplo):
{
  "login": "aluno1",
  "senha": "123"
}

Sucesso (201):
{
  "ok": true,
  "data": { "id": 1, "login": "aluno1", "favoritos": [] },
  "error": null
}

Falhas:
- 400 (faltando campos ou vazios):
  {
    "ok": false,
    "data": null,
    "error": { "code": 400, "message": "Login e senha são obrigatórios." }
  }
  ou
  {
    "ok": false,
    "data": null,
    "error": { "code": 400, "message": "Login e senha não podem ser vazios." }
  }

- 400 (login já existe, case-insensitive):
  {
    "ok": false,
    "data": null,
    "error": { "code": 400, "message": "Login já existe." }
  }

2.2) PUT /usuarios/{id}
Descrição: Edita o próprio usuário logado. Pode alterar "login" e/ou "senha".
Headers: Content-Type: application/json (requer sessão)
Body (exemplos):
- Atualizar login:
  { "login": "aluno1_novo" }

- Atualizar senha:
  { "senha": "novaSenha" }

- Atualizar ambos:
  { "login": "aluno1_novo", "senha": "novaSenha" }

Sucesso (200):
{
  "ok": true,
  "data": { "id": 1, "login": "aluno1_novo", "favoritos": [2, 7] },
  "error": null
}

Falhas:
- 401 (não logado):
  {
    "ok": false,
    "data": null,
    "error": { "code": 401, "message": "Usuário não está logado." }
  }

- 403 (tentando editar outro usuário):
  {
    "ok": false,
    "data": null,
    "error": { "code": 403, "message": "Você só pode editar seu próprio usuário." }
  }

- 400 (sem campos para atualizar):
  {
    "ok": false,
    "data": null,
    "error": { "code": 400, "message": "Nenhum dado para atualizar." }
  }

- 400 (login vazio / senha vazia):
  {
    "ok": false,
    "data": null,
    "error": { "code": 400, "message": "Login não pode ser vazio." }
  }

- 400 (novo login já existe, case-insensitive):
  {
    "ok": false,
    "data": null,
    "error": { "code": 400, "message": "Login já existe." }
  }

- 404 (usuário não encontrado — inconsistente com sessão):
  {
    "ok": false,
    "data": null,
    "error": { "code": 404, "message": "Usuário não encontrado." }
  }

2.3) DELETE /usuarios/{id}
Descrição: Exclui o próprio usuário logado. (Faz logout automático após exclusão.)
Headers: (requer sessão)

Sucesso (200):
{
  "ok": true,
  "data": null,
  "error": null
}

Falhas:
- 401 (não logado):
  {
    "ok": false,
    "data": null,
    "error": { "code": 401, "message": "Usuário não está logado." }
  }

- 403 (tentando excluir outro usuário):
  {
    "ok": false,
    "data": null,
    "error": { "code": 403, "message": "Você só pode excluir seu próprio usuário." }
  }

- 404 (usuário não existe):
  {
    "ok": false,
    "data": null,
    "error": { "code": 404, "message": "Usuário não encontrado." }
  }

Observação: As reclamações existentes com autor = login antigo permanecem visíveis (MVP).

================================================================================
3) RECLAMAÇÕES
================================================================================

3.1) POST /reclamacoes
Descrição: Cria uma nova reclamação (autor = login do usuário em sessão).
Headers: Content-Type: application/json (requer sessão)
Body (exemplo):
{
  "titulo": "Luz queimada no banheiro do bloco A",
  "corpo": "Sem iluminação no banheiro masculino, difícil usar à noite.",
  "categoria": "Infraestrutura"
}

Sucesso (201):
{
  "ok": true,
  "data": {
    "id": 10,
    "titulo": "Luz queimada no banheiro do bloco A",
    "corpo": "Sem iluminação no banheiro masculino, difícil usar à noite.",
    "categoria": "Infraestrutura",
    "data": "28/10/2025",
    "autor": "aluno1"
  },
  "error": null
}

Falhas:
- 401 (não logado):
  {
    "ok": false,
    "data": null,
    "error": { "code": 401, "message": "Usuário não está logado." }
  }

- 400 (faltando campos ou vazios):
  {
    "ok": false,
    "data": null,
    "error": { "code": 400, "message": "Título, corpo e categoria são obrigatórios." }
  }
  ou
  {
    "ok": false,
    "data": null,
    "error": { "code": 400, "message": "Título, corpo e categoria não podem ser vazios." }
  }

3.2) GET /reclamacoes
Descrição: Lista todas as reclamações (público). Suporta filtro por categoria.
Query opcional: ?categoria=Infraestrutura
Exemplos:
- /reclamacoes
- /reclamacoes?categoria=Alimentacao

Sucesso (200):
{
  "ok": true,
  "data": [
    {
      "id": 10,
      "titulo": "...",
      "corpo": "...",
      "categoria": "Infraestrutura",
      "data": "28/10/2025",
      "autor": "aluno1"
    },
    {
      "id": 11,
      "titulo": "...",
      "corpo": "...",
      "categoria": "Academico",
      "data": "28/10/2025",
      "autor": "aluno2"
    }
  ],
  "error": null
}

(Se nenhuma reclamação, "data": [])

3.3) GET /reclamacoes/{id}
Descrição: Retorna uma reclamação específica por ID (público).
Exemplo: /reclamacoes/10

Sucesso (200):
{
  "ok": true,
  "data": {
    "id": 10,
    "titulo": "...",
    "corpo": "...",
    "categoria": "Infraestrutura",
    "data": "28/10/2025",
    "autor": "aluno1"
  },
  "error": null
}

Falha:
- 404 (não encontrado):
  {
    "ok": false,
    "data": null,
    "error": { "code": 404, "message": "Reclamação não encontrada." }
  }

3.4) PUT /reclamacoes/{id}
Descrição: Edita uma reclamação existente (somente o autor).
Headers: Content-Type: application/json (requer sessão)
Body (exemplos — envie pelo menos um campo):
- { "titulo": "Novo título" }
- { "corpo": "Novo corpo" }
- { "categoria": "Nova categoria" }
- { "titulo": "T", "corpo": "C", "categoria": "Cat" }

Sucesso (200):
{
  "ok": true,
  "data": {
    "id": 10,
    "titulo": "Novo título",
    "corpo": "Novo corpo",
    "categoria": "Nova categoria",
    "data": "28/10/2025",
    "autor": "aluno1"
  },
  "error": null
}

Falhas:
- 401 (não logado):
  {
    "ok": false,
    "data": null,
    "error": { "code": 401, "message": "Usuário não está logado." }
  }

- 404 (não encontrado):
  {
    "ok": false,
    "data": null,
    "error": { "code": 404, "message": "Reclamação não encontrada." }
  }

- 403 (não é o autor):
  {
    "ok": false,
    "data": null,
    "error": { "code": 403, "message": "Somente o autor pode editar esta reclamação." }
  }

- 400 (nenhum campo / campo vazio):
  {
    "ok": false,
    "data": null,
    "error": { "code": 400, "message": "Nenhum dado para atualizar." }
  }
  ou
  {
    "ok": false,
    "data": null,
    "error": { "code": 400, "message": "Título não pode ser vazio." }
  }
  (mensagem muda conforme o campo inválido)

3.5) DELETE /reclamacoes/{id}
Descrição: Exclui uma reclamação (somente o autor). Remove o ID desta reclamação dos favoritos de todos os usuários.
Headers: (requer sessão)

Sucesso (200):
{
  "ok": true,
  "data": null,
  "error": null
}

Falhas:
- 401 (não logado):
  {
    "ok": false,
    "data": null,
    "error": { "code": 401, "message": "Usuário não está logado." }
  }

- 404 (não encontrado):
  {
    "ok": false,
    "data": null,
    "error": { "code": 404, "message": "Reclamação não encontrada." }
  }

- 403 (não é o autor):
  {
    "ok": false,
    "data": null,
    "error": { "code": 403, "message": "Somente o autor pode excluir esta reclamação." }
  }

3.6) GET /reclamacoes2
Descrição: Lista todas as reclamações (público), opcionalmente filtrando por categoria, e **acrescenta** em cada item o campo booleano **"favorito"** indicando se a reclamação está favoritada pelo **usuário informado**.
- **Parâmetros de query**:
  - **userId** (obrigatório): ID do usuário a considerar para a flag "favorito".
  - **categoria** (opcional): filtra por categoria (case-insensitive), ex.: ?categoria=Infraestrutura
- **Dupla camada de verificação**:
  1) validação do parâmetro `userId` (presença e inteiro > 0);
  2) verificação de existência do usuário em `usuarios.json`.
- **Sessão não é exigida** para esta rota.

Exemplos:
- /reclamacoes2?userId=1
- /reclamacoes2?userId=2&categoria=Infraestrutura

Sucesso (200):
{
  "ok": true,
  "data": [
    {
      "id": 10,
      "titulo": "Luz queimada no banheiro do bloco A",
      "corpo": "Sem iluminação no banheiro masculino, difícil usar à noite.",
      "categoria": "Infraestrutura",
      "data": "28/10/2025",
      "autor": "aluno1",
      "favorito": true
    },
    {
      "id": 11,
      "titulo": "Grade de disciplinas desatualizada",
      "corpo": "Portal ainda mostra grade antiga.",
      "categoria": "Academico",
      "data": "28/10/2025",
      "autor": "aluno2",
      "favorito": false
    }
  ],
  "error": null
}

Falhas:
- 400 (sem userId):
  {
    "ok": false,
    "data": null,
    "error": { "code": 400, "message": "Parâmetro 'userId' é obrigatório." }
  }

- 400 (userId inválido — não numérico ou <= 0):
  {
    "ok": false,
    "data": null,
    "error": { "code": 400, "message": "Parâmetro 'userId' inválido." }
  }

- 404 (usuário não encontrado):
  {
    "ok": false,
    "data": null,
    "error": { "code": 404, "message": "Usuário não encontrado." }
  }

================================================================================
4) FAVORITOS (USUÁRIO LOGADO)
================================================================================

4.1) POST /favoritos/{id}
Descrição: Marca a reclamação {id} como favorita do usuário logado.
Headers: (requer sessão)
Body: (sem body)

Sucesso (200):
{
  "ok": true,
  "data": null,
  "error": null
}

Falhas:
- 401 (não logado):
  {
    "ok": false,
    "data": null,
    "error": { "code": 401, "message": "Usuário não está logado." }
  }

- 404 (reclamação não encontrada):
  {
    "ok": false,
    "data": null,
    "error": { "code": 404, "message": "Reclamação não encontrada." }
  }

- 404 (usuário inconsistente — não encontrado por id da sessão):
  {
    "ok": false,
    "data": null,
    "error": { "code": 404, "message": "Usuário não encontrado." }
  }

- 400 (já favoritada):
  {
    "ok": false,
    "data": null,
    "error": { "code": 400, "message": "Reclamação já está nos favoritos." }
  }

4.2) DELETE /favoritos/{id}
Descrição: Remove a reclamação {id} dos favoritos do usuário logado.
Headers: (requer sessão)
Body: (sem body)

Sucesso (200):
{
  "ok": true,
  "data": null,
  "error": null
}

Falhas:
- 401 (não logado):
  {
    "ok": false,
    "data": null,
    "error": { "code": 401, "message": "Usuário não está logado." }
  }

- 404 (reclamação não encontrada):
  {
    "ok": false,
    "data": null,
    "error": { "code": 404, "message": "Reclamação não encontrada." }
  }

- 404 (usuário inconsistente):
  {
    "ok": false,
    "data": null,
    "error": { "code": 404, "message": "Usuário não encontrado." }
  }

- 400 (reclamação não está nos favoritos):
  {
    "ok": false,
    "data": null,
    "error": { "code": 400, "message": "Reclamação não está marcada como favorita." }
  }

4.3) GET /favoritos
Descrição: Retorna a lista de reclamações favoritadas pelo usuário logado.
Headers: (requer sessão)

Sucesso (200):
{
  "ok": true,
  "data": [
    {
      "id": 10,
      "titulo": "...",
      "corpo": "...",
      "categoria": "Infraestrutura",
      "data": "28/10/2025",
      "autor": "aluno1"
    }
  ],
  "error": null
}

Falhas:
- 401 (não logado):
  {
    "ok": false,
    "data": null,
    "error": { "code": 401, "message": "Usuário não está logado." }
  }

- 404 (usuário inconsistente):
  {
    "ok": false,
    "data": null,
    "error": { "code": 404, "message": "Usuário não encontrado." }
  }

================================================================================
EXEMPLOS DE SEQUÊNCIA DE TESTE (RESUMO)
================================================================================
1) Criar usuário:        POST /usuarios
2) Login:                POST /login
3) Criar reclamação:     POST /reclamacoes
4) Listar reclamações:   GET  /reclamacoes
5) Listar com favorito:  GET  /reclamacoes2?userId={id}[&categoria=...]
6) Editar reclamação:    PUT  /reclamacoes/{id}
7) Favoritar:            POST /favoritos/{id}
8) Listar favoritos:     GET  /favoritos
9) Desfavoritar:         DELETE /favoritos/{id}
10) Logout:              POST /logout
11) Editar usuário:      PUT  /usuarios/{id}
12) Excluir usuário:     DELETE /usuarios/{id}

================================================================================
FIM
================================================================================
"""

def main():
    print(DOCUMENTACAO_API)

if __name__ == "__main__":
    main()

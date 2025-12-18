from flask import Flask, request, jsonify, session
from flask_cors import CORS
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(
    app,
    supports_credentials=True,
    origins=["http://localhost:5173"]
)

app.config.update(
    SESSION_COOKIE_SAMESITE='Lax',
    SESSION_COOKIE_SECURE=False
)


# Chave secreta para assinatura de sessão (necessária para usar flask.session)
app.secret_key = 'supersecretkey'  # Em um projeto real, use uma chave forte e mantê-la segura.

# Caminhos dos "arquivos de banco de dados"
USERS_FILE = 'usuarios.json'
COMPLAINTS_FILE = 'reclamacoes.json'

# Se os arquivos JSON não existirem, cria-os com uma lista vazia
if not os.path.exists(USERS_FILE):
    with open(USERS_FILE, 'w', encoding='utf-8') as f:
        f.write('[]')
if not os.path.exists(COMPLAINTS_FILE):
    with open(COMPLAINTS_FILE, 'w', encoding='utf-8') as f:
        f.write('[]')

# Carrega os dados dos arquivos JSON (ou lista vazia se estiverem vazios)
with open(USERS_FILE, 'r', encoding='utf-8') as f:
    try:
        users = json.load(f)
    except json.JSONDecodeError:
        users = []
with open(COMPLAINTS_FILE, 'r', encoding='utf-8') as f:
    try:
        complaints = json.load(f)
    except json.JSONDecodeError:
        complaints = []

# Funções auxiliares para salvar os dados de volta nos arquivos JSON
def save_users():
    with open(USERS_FILE, 'w', encoding='utf-8') as f:
        json.dump(users, f, ensure_ascii=False, indent=4)

def save_complaints():
    with open(COMPLAINTS_FILE, 'w', encoding='utf-8') as f:
        json.dump(complaints, f, ensure_ascii=False, indent=4)

# Rota: Criar novo usuário
@app.route('/usuarios', methods=['POST'])
def criar_usuario():
    data = request.get_json()
    if not data or 'login' not in data or 'senha' not in data:
        return jsonify({"ok": False, "data": None, "error": {"code": 400, "message": "Login e senha são obrigatórios."}}), 400
    login = data['login'].strip()
    senha = data['senha'].strip()
    if not login or not senha:
        return jsonify({"ok": False, "data": None, "error": {"code": 400, "message": "Login e senha não podem ser vazios."}}), 400
    # Verifica se já existe usuário com o mesmo login (case insensitive)
    for u in users:
        if u['login'].lower() == login.lower():
            return jsonify({"ok": False, "data": None, "error": {"code": 400, "message": "Login já existe."}}), 400
    # Gera um novo ID para o usuário (1 + id máximo existente, ou 1 se nenhum usuário ainda)
    new_id = 1
    if users:
        new_id = max(u['id'] for u in users) + 1
    new_user = {
        "id": new_id,
        "login": login,
        "senha": senha,
        "favoritos": []
    }
    users.append(new_user)
    save_users()
    # Retorna os dados do novo usuário (omitindo a senha)
    result = {"id": new_id, "login": login, "favoritos": []}
    return jsonify({"ok": True, "data": result, "error": None}), 201

# Rota: Editar usuário (perfil)
@app.route('/usuarios/<int:user_id>', methods=['PUT'])
def editar_usuario(user_id):
    # Usuário deve estar logado
    if 'user_id' not in session:
        return jsonify({"ok": False, "data": None, "error": {"code": 401, "message": "Usuário não está logado."}}), 401
    # Usuário só pode editar a si próprio
    if session.get('user_id') != user_id:
        return jsonify({"ok": False, "data": None, "error": {"code": 403, "message": "Você só pode editar seu próprio usuário."}}), 403
    data = request.get_json()
    if not data:
        return jsonify({"ok": False, "data": None, "error": {"code": 400, "message": "Nenhum dado para atualizar."}}), 400
    user = next((u for u in users if u['id'] == user_id), None)
    if user is None:
        return jsonify({"ok": False, "data": None, "error": {"code": 404, "message": "Usuário não encontrado."}}), 404
    new_login = data.get('login')
    new_senha = data.get('senha')
    if new_login is None and new_senha is None:
        return jsonify({"ok": False, "data": None, "error": {"code": 400, "message": "Nenhum dado para atualizar."}}), 400
    # Atualiza o login se fornecido
    if new_login is not None:
        new_login = new_login.strip()
        if not new_login:
            return jsonify({"ok": False, "data": None, "error": {"code": 400, "message": "Login não pode ser vazio."}}), 400
        # Se o login é diferente do atual, verifica unicidade
        if new_login.lower() != user['login'].lower():
            for u in users:
                if u['login'].lower() == new_login.lower() and u['id'] != user_id:
                    return jsonify({"ok": False, "data": None, "error": {"code": 400, "message": "Login já existe."}}), 400
            # Atualiza o login do usuário
            old_login = user['login']
            user['login'] = new_login
            # Atualiza o campo autor em todas as reclamações feitas por este usuário
            for comp in complaints:
                if comp['autor'] == old_login:
                    comp['autor'] = new_login
            save_complaints()
            # Atualiza o login também na sessão
            session['user_login'] = new_login
    # Atualiza a senha se fornecida
    if new_senha is not None:
        new_senha = new_senha.strip()
        if not new_senha:
            return jsonify({"ok": False, "data": None, "error": {"code": 400, "message": "Senha não pode ser vazia."}}), 400
        user['senha'] = new_senha
    save_users()
    # Retorna dados atualizados do usuário (omitindo senha)
    result = {"id": user['id'], "login": user['login'], "favoritos": user['favoritos']}
    return jsonify({"ok": True, "data": result, "error": None}), 200

# Rota: Excluir usuário (deletar conta)
@app.route('/usuarios/<int:user_id>', methods=['DELETE'])
def deletar_usuario(user_id):
    if 'user_id' not in session:
        return jsonify({"ok": False, "data": None, "error": {"code": 401, "message": "Usuário não está logado."}}), 401
    if session.get('user_id') != user_id:
        return jsonify({"ok": False, "data": None, "error": {"code": 403, "message": "Você só pode excluir seu próprio usuário."}}), 403
    index = next((i for i, u in enumerate(users) if u['id'] == user_id), None)
    if index is None:
        return jsonify({"ok": False, "data": None, "error": {"code": 404, "message": "Usuário não encontrado."}}), 404
    # Remove o usuário da lista
    users.pop(index)
    save_users()
    # Encerra a sessão (logout automático)
    session.clear()
    return jsonify({"ok": True, "data": None, "error": None}), 200

# Rota: Login do usuário
@app.route('/login', methods=['POST'])
def login_user():
    data = request.get_json()
    if not data or 'login' not in data or 'senha' not in data:
        return jsonify({"ok": False, "data": None, "error": {"code": 400, "message": "Login e senha são obrigatórios."}}), 400
    login = data['login']
    senha = data['senha']
    print(login, senha)
    # Busca usuário com login e senha correspondentes
    user = next((u for u in users if u['login'] == login and u['senha'] == senha), None)
    print(user)
    if user is None:
        return jsonify({"ok": False, "data": None, "error": {"code": 401, "message": "Login ou senha incorretos."}}), 401
    # Se já houver um usuário logado nesta sessão
    if 'user_id' in session:
        if session['user_id'] == user['id']:
            # Se é o mesmo usuário já logado, apenas retorna sucesso
            return jsonify({"ok": True, "data": {"id": user['id'], "login": user['login']}, "error": None}), 200
        else:
            # Se for diferente, requer logout primeiro
            return jsonify({"ok": False, "data": None, "error": {"code": 400, "message": "Já existe um usuário logado."}}), 400
    # Realiza login (salva usuário na sessão)
    session['user_id'] = user['id']
    session['user_login'] = user['login']
    return jsonify({"ok": True, "data": {"id": user['id'], "login": user['login']}, "error": None}), 200


# Rota: Logout do usuário
@app.route('/logout', methods=['POST'])
def logout_user():
    if 'user_id' not in session:
        return jsonify({"ok": False, "data": None, "error": {"code": 401, "message": "Usuário não está logado."}}), 401
    session.clear()
    return jsonify({"ok": True, "data": None, "error": None}), 200

# Rota: Criar nova reclamação
@app.route('/reclamacoes', methods=['POST'])
def criar_reclamacao():
    if 'user_id' not in session:
        return jsonify({"ok": False, "data": None, "error": {"code": 401, "message": "Usuário não está logado."}}), 401
    data = request.get_json()
    if not data or 'titulo' not in data or 'corpo' not in data or 'categoria' not in data:
        return jsonify({"ok": False, "data": None, "error": {"code": 400, "message": "Título, corpo e categoria são obrigatórios."}}), 400
    titulo = data['titulo'].strip()
    corpo = data['corpo'].strip()
    categoria = data['categoria'].strip()
    if not titulo or not corpo or not categoria:
        return jsonify({"ok": False, "data": None, "error": {"code": 400, "message": "Título, corpo e categoria não podem ser vazios."}}), 400
    # Gera novo ID de reclamação
    new_id = 1
    if complaints:
        new_id = max(c['id'] for c in complaints) + 1
    data_str = datetime.now().strftime("%d/%m/%Y")
    autor = session.get('user_login')
    new_complaint = {
        "id": new_id,
        "titulo": titulo,
        "corpo": corpo,
        "categoria": categoria,
        "data": data_str,
        "autor": autor
    }
    complaints.append(new_complaint)
    save_complaints()
    return jsonify({"ok": True, "data": new_complaint, "error": None}), 201

# Rota: Listar reclamações (com filtro opcional por categoria)
@app.route('/reclamacoes', methods=['GET'])
def listar_reclamacoes():
    categoria = request.args.get('categoria')
    if categoria:
        # Filtra reclamações por categoria (case-insensitive)
        filtered = [c for c in complaints if c['categoria'].lower() == categoria.lower()]
        return jsonify({"ok": True, "data": filtered, "error": None}), 200
    else:
        return jsonify({"ok": True, "data": complaints, "error": None}), 200

# NOVA ROTA: Listar reclamações com flag "favorito" para um userId
# Dupla camada de verificação:
#   1) validação do parâmetro userId (presença e inteiro positivo)
#   2) existência do usuário com esse userId
@app.route('/reclamacoes2', methods=['GET'])
def listar_reclamacoes_com_favorito():
    user_id_param = request.args.get('userId')
    if user_id_param is None:
        return jsonify({"ok": False, "data": None, "error": {"code": 400, "message": "Parâmetro 'userId' é obrigatório."}}), 400
    try:
        user_id_int = int(user_id_param)
        if user_id_int <= 0:
            raise ValueError
    except ValueError:
        return jsonify({"ok": False, "data": None, "error": {"code": 400, "message": "Parâmetro 'userId' inválido."}}), 400

    # Verifica existência do usuário
    user = next((u for u in users if u['id'] == user_id_int), None)
    if user is None:
        return jsonify({"ok": False, "data": None, "error": {"code": 404, "message": "Usuário não encontrado."}}), 404

    # Filtro opcional por categoria (compatível com /reclamacoes)
    categoria = request.args.get('categoria')
    base_list = complaints
    if categoria:
        base_list = [c for c in complaints if c['categoria'].lower() == categoria.lower()]

    # Garante estrutura de favoritos válida
    fav_ids = set(user['favoritos']) if isinstance(user.get('favoritos'), list) else set()

    # Monta lista com atributo adicional 'favorito'
    resultado = []
    for c in base_list:
        item = dict(c)  # cópia para não alterar o original
        item['favorito'] = (c.get('id') in fav_ids)
        resultado.append(item)

    return jsonify({"ok": True, "data": resultado, "error": None}), 200

# Rota: Obter reclamação específica por ID
@app.route('/reclamacoes/<int:complaint_id>', methods=['GET'])
def obter_reclamacao(complaint_id):
    comp = next((c for c in complaints if c['id'] == complaint_id), None)
    if comp is None:
        return jsonify({"ok": False, "data": None, "error": {"code": 404, "message": "Reclamação não encontrada."}}), 404
    return jsonify({"ok": True, "data": comp, "error": None}), 200

# Rota: Editar reclamação existente (somente autor)
@app.route('/reclamacoes/<int:complaint_id>', methods=['PUT'])
def editar_reclamacao(complaint_id):
    if 'user_id' not in session:
        return jsonify({"ok": False, "data": None, "error": {"code": 401, "message": "Usuário não está logado."}}), 401
    comp = next((c for c in complaints if c['id'] == complaint_id), None)
    if comp is None:
        return jsonify({"ok": False, "data": None, "error": {"code": 404, "message": "Reclamação não encontrada."}}), 404
    if comp['autor'] != session.get('user_login'):
        return jsonify({"ok": False, "data": None, "error": {"code": 403, "message": "Somente o autor pode editar esta reclamação."}}), 403
    data = request.get_json()
    if not data:
        return jsonify({"ok": False, "data": None, "error": {"code": 400, "message": "Nenhum dado para atualizar."}}), 400
    updated = False
    if 'titulo' in data:
        new_titulo = data['titulo'].strip()
        if not new_titulo:
            return jsonify({"ok": False, "data": None, "error": {"code": 400, "message": "Título não pode ser vazio."}}), 400
        comp['titulo'] = new_titulo
        updated = True
    if 'corpo' in data:
        new_corpo = data['corpo'].strip()
        if not new_corpo:
            return jsonify({"ok": False, "data": None, "error": {"code": 400, "message": "Corpo não pode ser vazio."}}), 400
        comp['corpo'] = new_corpo
        updated = True
    if 'categoria' in data:
        new_cat = data['categoria'].strip()
        if not new_cat:
            return jsonify({"ok": False, "data": None, "error": {"code": 400, "message": "Categoria não pode ser vazia."}}), 400
        comp['categoria'] = new_cat
        updated = True
    if not updated:
        return jsonify({"ok": False, "data": None, "error": {"code": 400, "message": "Nenhum dado para atualizar."}}), 400
    save_complaints()
    return jsonify({"ok": True, "data": comp, "error": None}), 200

# Rota: Excluir reclamação (somente autor)
@app.route('/reclamacoes/<int:complaint_id>', methods=['DELETE'])
def deletar_reclamacao(complaint_id):
    if 'user_id' not in session:
        return jsonify({"ok": False, "data": None, "error": {"code": 401, "message": "Usuário não está logado."}}), 401
    index = next((i for i, c in enumerate(complaints) if c['id'] == complaint_id), None)
    if index is None:
        return jsonify({"ok": False, "data": None, "error": {"code": 404, "message": "Reclamação não encontrada."}}), 404
    comp = complaints[index]
    if comp['autor'] != session.get('user_login'):
        return jsonify({"ok": False, "data": None, "error": {"code": 403, "message": "Somente o autor pode excluir esta reclamação."}}), 403
    # Remove a reclamação da lista
    complaints.pop(index)
    save_complaints()
    # Remove o ID da reclamação excluída de quaisquer listas de favoritos de usuários
    for u in users:
        if complaint_id in u['favoritos']:
            u['favoritos'].remove(complaint_id)
    save_users()
    return jsonify({"ok": True, "data": None, "error": None}), 200

# Rota: Marcar reclamação como favorita
@app.route('/favoritos/<int:complaint_id>', methods=['POST'])
def favoritar_reclamacao(complaint_id):
    if 'user_id' not in session:
        return jsonify({"ok": False, "data": None, "error": {"code": 401, "message": "Usuário não está logado."}}), 401
    comp = next((c for c in complaints if c['id'] == complaint_id), None)
    if comp is None:
        return jsonify({"ok": False, "data": None, "error": {"code": 404, "message": "Reclamação não encontrada."}}), 404
    user = next((u for u in users if u['id'] == session.get('user_id')), None)
    if user is None:
        return jsonify({"ok": False, "data": None, "error": {"code": 404, "message": "Usuário não encontrado."}}), 404
    if complaint_id in user['favoritos']:
        return jsonify({"ok": False, "data": None, "error": {"code": 400, "message": "Reclamação já está nos favoritos."}}), 400
    user['favoritos'].append(complaint_id)
    save_users()
    return jsonify({"ok": True, "data": None, "error": None}), 200

# Rota: Desmarcar reclamação favorita
@app.route('/favoritos/<int:complaint_id>', methods=['DELETE'])
def desfavoritar_reclamacao(complaint_id):
    if 'user_id' not in session:
        return jsonify({"ok": False, "data": None, "error": {"code": 401, "message": "Usuário não está logado."}}), 401
    comp = next((c for c in complaints if c['id'] == complaint_id), None)
    if comp is None:
        return jsonify({"ok": False, "data": None, "error": {"code": 404, "message": "Reclamação não encontrada."}}), 404
    user = next((u for u in users if u['id'] == session.get('user_id')), None)
    if user is None:
        return jsonify({"ok": False, "data": None, "error": {"code": 404, "message": "Usuário não encontrado."}}), 404
    if complaint_id not in user['favoritos']:
        return jsonify({"ok": False, "data": None, "error": {"code": 400, "message": "Reclamação não está marcada como favorita."}}), 400
    user['favoritos'].remove(complaint_id)
    save_users()
    return jsonify({"ok": True, "data": None, "error": None}), 200

# Rota: Listar favoritos do usuário logado
@app.route('/favoritos', methods=['GET'])
def listar_favoritos():
    if 'user_id' not in session:
        return jsonify({"ok": False, "data": None, "error": {"code": 401, "message": "Usuário não está logado."}}), 401
    user = next((u for u in users if u['id'] == session.get('user_id')), None)
    if user is None:
        return jsonify({"ok": False, "data": None, "error": {"code": 404, "message": "Usuário não encontrado."}}), 404
    fav_ids = set(user['favoritos'])
    favoritos_data = [c for c in complaints if c['id'] in fav_ids]
    return jsonify({"ok": True, "data": favoritos_data, "error": None}), 200

# Inicializa o servidor Flask apenas se este arquivo for executado diretamente
if __name__ == '__main__':
    app.run(debug=True)
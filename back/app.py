from flask import Flask, request, jsonify, session, g
import json
import os, base64
from datetime import datetime
from flask_cors import CORS
from functools import wraps
from secrets import token_urlsafe

app = Flask(__name__)

# CORS liberado para uso com file:// e porta 63342; vamos trabalhar com Bearer
CORS(app,
     resources={r"/*": {"origins": "*"}},
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "DELETE", "PUT", "OPTIONS"])

# Cookies de sessão em dev (continuam funcionando se você servir tudo pela mesma origem)
app.config["SESSION_COOKIE_SAMESITE"] = "None"
app.config["SESSION_COOKIE_SECURE"] = False
app.secret_key = 'supersecretkey'  # Em produção, use uma chave forte e secreta

# "Banco de dados" em JSON
USERS_FILE = 'usuarios.json'
COMPLAINTS_FILE = 'reclamacoes.json'

if not os.path.exists(USERS_FILE):
    with open(USERS_FILE, 'w', encoding='utf-8') as f:
        f.write('[]')
if not os.path.exists(COMPLAINTS_FILE):
    with open(COMPLAINTS_FILE, 'w', encoding='utf-8') as f:
        f.write('[]')

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

def save_users():
    with open(USERS_FILE, 'w', encoding='utf-8') as f:
        json.dump(users, f, ensure_ascii=False, indent=4)

def save_complaints():
    with open(COMPLAINTS_FILE, 'w', encoding='utf-8') as f:
        json.dump(complaints, f, ensure_ascii=False, indent=4)

def load_users():
    global users
    with open(USERS_FILE, 'r', encoding='utf-8') as f:
        try:
            users = json.load(f)
        except json.JSONDecodeError:
            users = []

def load_complaints():
    global complaints
    with open(COMPLAINTS_FILE, 'r', encoding='utf-8') as f:
        try:
            complaints = json.load(f)
        except json.JSONDecodeError:
            complaints = []

# ==========
# Autenticação (SESSION ou BEARER TOKEN)
# ==========

# Armazena tokens válidos em memória (DEV). Reiniciou o servidor, os tokens somem.
TOKENS = {}  # token -> user_id

def _set_g_user(user_id: int):
    """Guarda no contexto da requisição o id e login do usuário atual."""
    g.user_id = user_id
    user = next((u for u in users if u['id'] == user_id), None)
    g.user_login = user['login'] if user else None

def _get_user_from_auth_header():
    """Tenta extrair user_id de Authorization: Bearer <token>."""
    auth = request.headers.get('Authorization', '')
    if auth.startswith('Bearer '):
        token = auth.split(' ', 1)[1].strip()
        user_id = TOKENS.get(token)
        if user_id:
            return user_id
    return None

def current_user_id():
    """Devolve o user_id autenticado por Token ou por Session; senão None."""
    load_users()  # garante users atual para resolver login
    # 1) Tenta Token
    uid = _get_user_from_auth_header()
    if uid:
        _set_g_user(uid)
        return uid
    # 2) Fallback: sessão
    if 'user_id' in session:
        _set_g_user(session['user_id'])
        return g.user_id
    return None

def require_auth(fn):
    """Decorator para proteger rotas com Token OU Sessão."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        uid = current_user_id()
        if not uid:
            return jsonify({"ok": False, "data": None,
                            "error": {"code": 401, "message": "Usuário não está logado."}}), 401
        return fn(*args, **kwargs)
    return wrapper

# ==========
# Rotas
# ==========

@app.route('/buscarreclamacao', methods=['GET'])
def buscar_reclamacao():
    load_complaints()
    nome = request.args.get('nome')
    if not nome:
        return jsonify({
            "ok": False, "data": None,
            "error": {"code": 400, "message": "Parâmetro 'nome' é obrigatório."}
        }), 400
    nome = nome.strip()
    if not nome:
        return jsonify({
            "ok": False, "data": None,
            "error": {"code": 400, "message": "O parâmetro 'nome' não pode ser vazio."}
        }), 400
    resultados = [c for c in complaints if nome.lower() in c.get('titulo', '').lower()]
    return jsonify({"ok": True, "data": resultados, "error": None}), 200

@app.route('/images', methods=['GET'])
def get_image():
    nome = request.args.get('nome')
    if not nome:
        return jsonify(ok=False, data=None, error="Parâmetro 'nome' não fornecido")

    ext = os.path.splitext(nome)[1].lower()
    if ext not in {'.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'}:
        return jsonify(ok=False, data=None, error="Extensão inválida")

    image_path = os.path.join(app.root_path, 'imagens', nome)
    if not os.path.exists(image_path):
        return jsonify(ok=False, data=None, error="Arquivo não encontrado")

    with open(image_path, 'rb') as f:
        encoded = base64.b64encode(f.read()).decode('utf-8')

    return jsonify(ok=True, data={'base64': encoded}, error=None)

# Usuários
@app.route('/usuarios', methods=['POST'])
def criar_usuario():
    load_users()
    data = request.get_json()
    if not data or 'login' not in data or 'senha' not in data:
        return jsonify({"ok": False, "data": None,
                        "error": {"code": 400, "message": "Login e senha são obrigatórios."}}), 400
    login = data['login'].strip()
    senha = data['senha'].strip()
    if not login or not senha:
        return jsonify({"ok": False, "data": None,
                        "error": {"code": 400, "message": "Login e senha não podem ser vazios."}}), 400
    for u in users:
        if u['login'].lower() == login.lower():
            return jsonify({"ok": False, "data": None,
                            "error": {"code": 400, "message": "Login já existe."}}), 400
    new_id = max([u['id'] for u in users], default=0) + 1
    new_user = {"id": new_id, "login": login, "senha": senha, "favoritos": []}
    users.append(new_user)
    save_users()
    result = {"id": new_id, "login": login, "favoritos": []}
    return jsonify({"ok": True, "data": result, "error": None}), 201

@app.route('/usuarios/<int:user_id>', methods=['PUT'])
@require_auth
def editar_usuario(user_id):
    load_users()
    load_complaints()
    if g.user_id != user_id:
        return jsonify({"ok": False, "data": None,
                        "error": {"code": 403, "message": "Você só pode editar seu próprio usuário."}}), 403
    data = request.get_json()
    if not data:
        return jsonify({"ok": False, "data": None,
                        "error": {"code": 400, "message": "Nenhum dado para atualizar."}}), 400
    user = next((u for u in users if u['id'] == user_id), None)
    if user is None:
        return jsonify({"ok": False, "data": None,
                        "error": {"code": 404, "message": "Usuário não encontrado."}}), 404

    new_login = data.get('login')
    new_senha = data.get('senha')
    if new_login is None and new_senha is None:
        return jsonify({"ok": False, "data": None,
                        "error": {"code": 400, "message": "Nenhum dado para atualizar."}}), 400

    if new_login is not None:
        new_login = new_login.strip()
        if not new_login:
            return jsonify({"ok": False, "data": None,
                            "error": {"code": 400, "message": "Login não pode ser vazio."}}), 400
        if new_login.lower() != user['login'].lower():
            for u in users:
                if u['login'].lower() == new_login.lower() and u['id'] != user_id:
                    return jsonify({"ok": False, "data": None,
                                    "error": {"code": 400, "message": "Login já existe."}}), 400
            old_login = user['login']
            user['login'] = new_login
            for comp in complaints:
                if comp['autor'] == old_login:
                    comp['autor'] = new_login
            save_complaints()
            session['user_login'] = new_login  # mantém compatibilidade com sessão

    if new_senha is not None:
        new_senha = new_senha.strip()
        if not new_senha:
            return jsonify({"ok": False, "data": None,
                            "error": {"code": 400, "message": "Senha não pode ser vazia."}}), 400
        user['senha'] = new_senha

    save_users()
    result = {"id": user['id'], "login": user['login'], "favoritos": user['favoritos']}
    return jsonify({"ok": True, "data": result, "error": None}), 200

@app.route('/usuarios/<int:user_id>', methods=['DELETE'])
@require_auth
def deletar_usuario(user_id):
    load_users()
    if g.user_id != user_id:
        return jsonify({"ok": False, "data": None,
                        "error": {"code": 403, "message": "Você só pode excluir seu próprio usuário."}}), 403
    index = next((i for i, u in enumerate(users) if u['id'] == user_id), None)
    if index is None:
        return jsonify({"ok": False, "data": None,
                        "error": {"code": 404, "message": "Usuário não encontrado."}}), 404
    users.pop(index)
    save_users()
    session.clear()
    # Também podemos invalidar tokens desse user (opcional); aqui simples:
    for t, uid in list(TOKENS.items()):
        if uid == user_id:
            TOKENS.pop(t, None)
    return jsonify({"ok": True, "data": None, "error": None}), 200

# Login / Logout
@app.route("/login", methods=["OPTIONS"])
def login_options():
    return ("", 204)

@app.route('/login', methods=['POST'])
def login_user():
    load_users()
    data = request.get_json()
    if not data or 'login' not in data or 'senha' not in data:
        return jsonify({"ok": False, "data": None,
                        "error": {"code": 400, "message": "Login e senha são obrigatórios."}}), 400
    login = data['login']
    senha = data['senha']
    print(f'TESTE {login} = {senha}')
    user = next((u for u in users if u['login'] == login and u['senha'] == senha), None)
    print(users)
    if user is None:
        return jsonify({"ok": False, "data": None,
                        "error": {"code": 401, "message": "Login ou senha incorretos."}}), 401

    # Mantém compatível com sessão
    session['user_id'] = user['id']
    session['user_login'] = user['login']

    # Emite token para uso via Authorization: Bearer
    token = token_urlsafe(32)
    TOKENS[token] = user['id']

    return jsonify({"ok": True,
                    "data": {"id": user['id'], "login": user['login'], "token": token},
                    "error": None}), 200

@app.route('/logout', methods=['POST'])
def logout_user():
    # Se vier Bearer, invalida o token
    auth = request.headers.get('Authorization', '')
    if auth.startswith('Bearer '):
        token = auth.split(' ', 1)[1].strip()
        TOKENS.pop(token, None)
    # Limpa sessão (se houver)
    session.clear()
    return jsonify({"ok": True, "data": None, "error": None}), 200

# Reclamações
@app.route('/reclamacoes', methods=['POST'])
@require_auth
def criar_reclamacao():
    load_complaints()
    data = request.get_json()
    if not data or 'titulo' not in data or 'corpo' not in data or 'categoria' not in data:
        return jsonify({"ok": False, "data": None,
                        "error": {"code": 400, "message": "Título, corpo e categoria são obrigatórios."}}), 400
    titulo = data['titulo'].strip()
    corpo = data['corpo'].strip()
    categoria = data['categoria'].strip()
    if not titulo or not corpo or not categoria:
        return jsonify({"ok": False, "data": None,
                        "error": {"code": 400, "message": "Título, corpo e categoria não podem ser vazios."}}), 400

    new_id = max([c['id'] for c in complaints], default=0) + 1
    data_str = datetime.now().strftime("%d/%m/%Y")
    autor = g.get('user_login')
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

@app.route('/reclamacoes', methods=['GET'])
def listar_reclamacoes():
    load_complaints()
    categoria = request.args.get('categoria')
    if categoria:
        filtered = [c for c in complaints if c['categoria'].lower() == categoria.lower()]
        return jsonify({"ok": True, "data": filtered, "error": None}), 200
    else:
        return jsonify({"ok": True, "data": complaints, "error": None}), 200

@app.route('/reclamacoes2', methods=['GET'])
def listar_reclamacoes_com_favorito():
    load_users()
    load_complaints()
    user_id_param = request.args.get('userId')
    if user_id_param is None:
        return jsonify({"ok": False, "data": None,
                        "error": {"code": 400, "message": "Parâmetro 'userId' é obrigatório."}}), 400
    try:
        user_id_int = int(user_id_param)
        if user_id_int <= 0:
            raise ValueError
    except ValueError:
        return jsonify({"ok": False, "data": None,
                        "error": {"code": 400, "message": "Parâmetro 'userId' inválido."}}), 400

    user = next((u for u in users if u['id'] == user_id_int), None)
    if user is None:
        return jsonify({"ok": False, "data": None,
                        "error": {"code": 404, "message": "Usuário não encontrado."}}), 404

    categoria = request.args.get('categoria')
    base_list = complaints
    if categoria:
        base_list = [c for c in complaints if c['categoria'].lower() == categoria.lower()]

    fav_ids = set(user['favoritos']) if isinstance(user.get('favoritos'), list) else set()

    resultado = []
    for c in base_list:
        item = dict(c)
        item['favorito'] = (c.get('id') in fav_ids)
        resultado.append(item)

    return jsonify({"ok": True, "data": resultado, "error": None}), 200

@app.route('/reclamacoes/<int:complaint_id>', methods=['GET'])
def obter_reclamacao(complaint_id):
    load_complaints()
    comp = next((c for c in complaints if c['id'] == complaint_id), None)
    if comp is None:
        return jsonify({"ok": False, "data": None,
                        "error": {"code": 404, "message": "Reclamação não encontrada."}}), 404
    return jsonify({"ok": True, "data": comp, "error": None}), 200

@app.route('/reclamacoes/<int:complaint_id>', methods=['PUT'])
@require_auth
def editar_reclamacao(complaint_id):
    load_complaints()
    comp = next((c for c in complaints if c['id'] == complaint_id), None)
    if comp is None:
        return jsonify({"ok": False, "data": None,
                        "error": {"code": 404, "message": "Reclamação não encontrada."}}), 404
    if comp['autor'] != g.get('user_login'):
        return jsonify({"ok": False, "data": None,
                        "error": {"code": 403, "message": "Somente o autor pode editar esta reclamação."}}), 403
    data = request.get_json()
    if not data:
        return jsonify({"ok": False, "data": None,
                        "error": {"code": 400, "message": "Nenhum dado para atualizar."}}), 400
    updated = False
    if 'titulo' in data:
        new_titulo = data['titulo'].strip()
        if not new_titulo:
            return jsonify({"ok": False, "data": None,
                            "error": {"code": 400, "message": "Título não pode ser vazio."}}), 400
        comp['titulo'] = new_titulo
        updated = True
    if 'corpo' in data:
        new_corpo = data['corpo'].strip()
        if not new_corpo:
            return jsonify({"ok": False, "data": None,
                            "error": {"code": 400, "message": "Corpo não pode ser vazio."}}), 400
        comp['corpo'] = new_corpo
        updated = True
    if 'categoria' in data:
        new_cat = data['categoria'].strip()
        if not new_cat:
            return jsonify({"ok": False, "data": None,
                            "error": {"code": 400, "message": "Categoria não pode ser vazia."}}), 400
        comp['categoria'] = new_cat
        updated = True
    if not updated:
        return jsonify({"ok": False, "data": None,
                        "error": {"code": 400, "message": "Nenhum dado para atualizar."}}), 400
    save_complaints()
    return jsonify({"ok": True, "data": comp, "error": None}), 200

@app.route('/reclamacoes/<int:complaint_id>', methods=['DELETE'])
@require_auth
def deletar_reclamacao(complaint_id):
    load_users()
    load_complaints()
    index = next((i for i, c in enumerate(complaints) if c['id'] == complaint_id), None)
    if index is None:
        return jsonify({"ok": False, "data": None,
                        "error": {"code": 404, "message": "Reclamação não encontrada."}}), 404
    comp = complaints[index]
    if comp['autor'] != g.get('user_login'):
        return jsonify({"ok": False, "data": None,
                        "error": {"code": 403, "message": "Somente o autor pode excluir esta reclamação."}}), 403
    complaints.pop(index)
    save_complaints()
    for u in users:
        if complaint_id in u['favoritos']:
            u['favoritos'].remove(complaint_id)
    save_users()
    return jsonify({"ok": True, "data": None, "error": None}), 200

# Favoritos
@app.route('/favoritos/<int:complaint_id>', methods=['POST'])
@require_auth
def favoritar_reclamacao(complaint_id):
    load_users()
    load_complaints()
    comp = next((c for c in complaints if c['id'] == complaint_id), None)
    if comp is None:
        return jsonify({"ok": False, "data": None,
                        "error": {"code": 404, "message": "Reclamação não encontrada."}}), 404
    user = next((u for u in users if u['id'] == g.user_id), None)
    if user is None:
        return jsonify({"ok": False, "data": None,
                        "error": {"code": 404, "message": "Usuário não encontrado."}}), 404
    if complaint_id in user['favoritos']:
        return jsonify({"ok": False, "data": None,
                        "error": {"code": 400, "message": "Reclamação já está nos favoritos."}}), 400
    user['favoritos'].append(complaint_id)
    save_users()
    return jsonify({"ok": True, "data": None, "error": None}), 200

@app.route('/favoritos/<int:complaint_id>', methods=['DELETE'])
@require_auth
def desfavoritar_reclamacao(complaint_id):
    load_users()
    load_complaints()
    comp = next((c for c in complaints if c['id'] == complaint_id), None)
    if comp is None:
        return jsonify({"ok": False, "data": None,
                        "error": {"code": 404, "message": "Reclamação não encontrada."}}), 404
    user = next((u for u in users if u['id'] == g.user_id), None)
    if user is None:
        return jsonify({"ok": False, "data": None,
                        "error": {"code": 404, "message": "Usuário não encontrado."}}), 404
    if complaint_id not in user['favoritos']:
        return jsonify({"ok": False, "data": None,
                        "error": {"code": 400, "message": "Reclamação não está marcada como favorita."}}), 400
    user['favoritos'].remove(complaint_id)
    save_users()
    return jsonify({"ok": True, "data": None, "error": None}), 200

@app.route('/favoritos', methods=['GET'])
@require_auth
def listar_favoritos():
    load_users()
    load_complaints()
    user = next((u for u in users if u['id'] == g.user_id), None)
    if user is None:
        return jsonify({"ok": False, "data": None,
                        "error": {"code": 404, "message": "Usuário não encontrado."}}), 404
    fav_ids = set(user['favoritos'])
    favoritos_data = [c for c in complaints if c['id'] in fav_ids]
    return jsonify({"ok": True, "data": favoritos_data, "error": None}), 200

if __name__ == '__main__':
    app.run(debug=True)
    # app.run(host="127.0.0.1", debug=True)

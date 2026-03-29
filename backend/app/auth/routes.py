from flask import Blueprint, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from ..utils import get_db, make_response

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        body = request.get_json(silent=True) or {}
        username = body.get('username', '').strip()
        password = body.get('password', '').strip()
        email = body.get('email', '').strip()

        if not username or not password:
            return make_response(400, message='username and password are required')

        if len(password) < 6:
            return make_response(400, message='password must be at least 6 characters')

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
        if cursor.fetchone():
            conn.close()
            return make_response(400, message='username already exists')

        cursor.execute(
            "INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)",
            (username, generate_password_hash(password, method='pbkdf2:sha256'), email)
        )
        conn.commit()
        user_id = cursor.lastrowid
        conn.close()

        token = create_access_token(identity=str(user_id))
        return make_response(200, data={
            'token': token,
            'user': {'id': user_id, 'username': username, 'email': email, 'role': 'user'}
        }, message='register success')
    except Exception as e:
        return make_response(500, message=str(e))


@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        body = request.get_json(silent=True) or {}
        username = body.get('username', '').strip()
        password = body.get('password', '').strip()

        if not username or not password:
            return make_response(400, message='username and password are required')

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
        row = cursor.fetchone()
        conn.close()

        if not row or not check_password_hash(row['password_hash'], password):
            return make_response(401, message='invalid username or password')

        token = create_access_token(identity=str(row['id']))
        return make_response(200, data={
            'token': token,
            'user': {
                'id': row['id'],
                'username': row['username'],
                'email': row['email'],
                'avatar': row['avatar'],
                'role': row['role'],
                'created_at': row['created_at'],
            }
        }, message='login success')
    except Exception as e:
        return make_response(500, message=str(e))


@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        user_id = get_jwt_identity()
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id, username, email, avatar, role, created_at FROM users WHERE id = ?", (user_id,))
        row = cursor.fetchone()
        conn.close()

        if not row:
            return make_response(404, message='user not found')

        return make_response(200, data=dict(row))
    except Exception as e:
        return make_response(500, message=str(e))


@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        user_id = get_jwt_identity()
        body = request.get_json(silent=True) or {}
        username = body.get('username', '').strip()
        email = body.get('email', '').strip()
        avatar = body.get('avatar', '').strip()

        conn = get_db()
        cursor = conn.cursor()

        if username:
            cursor.execute("SELECT id FROM users WHERE username = ? AND id != ?", (username, user_id))
            if cursor.fetchone():
                conn.close()
                return make_response(400, message='username already taken')

        updates = []
        params = []
        if username:
            updates.append("username = ?")
            params.append(username)
        if email:
            updates.append("email = ?")
            params.append(email)
        if avatar:
            updates.append("avatar = ?")
            params.append(avatar)

        if not updates:
            conn.close()
            return make_response(400, message='no fields to update')

        params.append(user_id)
        cursor.execute(f"UPDATE users SET {', '.join(updates)} WHERE id = ?", params)
        conn.commit()

        cursor.execute("SELECT id, username, email, avatar, role, created_at FROM users WHERE id = ?", (user_id,))
        row = cursor.fetchone()
        conn.close()

        return make_response(200, data=dict(row), message='profile updated')
    except Exception as e:
        return make_response(500, message=str(e))


@auth_bp.route('/password', methods=['PUT'])
@jwt_required()
def change_password():
    try:
        user_id = get_jwt_identity()
        body = request.get_json(silent=True) or {}
        old_password = body.get('old_password', '').strip()
        new_password = body.get('new_password', '').strip()

        if not old_password or not new_password:
            return make_response(400, message='old_password and new_password are required')

        if len(new_password) < 6:
            return make_response(400, message='new password must be at least 6 characters')

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT password_hash FROM users WHERE id = ?", (user_id,))
        row = cursor.fetchone()

        if not row or not check_password_hash(row['password_hash'], old_password):
            conn.close()
            return make_response(400, message='old password is incorrect')

        cursor.execute("UPDATE users SET password_hash = ? WHERE id = ?",
                        (generate_password_hash(new_password, method='pbkdf2:sha256'), user_id))
        conn.commit()
        conn.close()

        return make_response(200, message='password changed successfully')
    except Exception as e:
        return make_response(500, message=str(e))

import sqlite3
from flask import jsonify
from config import Config


def make_response(code=200, data=None, message='success'):
    return jsonify({'code': code, 'data': data, 'message': message}), 200 if code < 400 else code


def get_db():
    """Get a database connection with row factory enabled."""
    conn = sqlite3.connect(Config.DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

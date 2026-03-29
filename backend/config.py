import os
from datetime import timedelta


class Config:
    SECRET_KEY = 'taobao-analyzer-secret-key-2024'
    JWT_SECRET_KEY = 'jwt-secret-key-taobao-analyzer-2024-secure'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
    DATABASE_PATH = os.path.join(
        os.path.dirname(os.path.abspath(__file__)), 'data', 'taobao.db'
    )

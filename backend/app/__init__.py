from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config


def create_app():
    app = Flask(__name__)

    # Configuration
    app.config['SECRET_KEY'] = Config.SECRET_KEY
    app.config['JWT_SECRET_KEY'] = Config.JWT_SECRET_KEY
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = Config.JWT_ACCESS_TOKEN_EXPIRES

    # CORS
    CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "http://localhost:5173"]}}, supports_credentials=True)

    # JWT
    JWTManager(app)

    # Register blueprints
    from .auth.routes import auth_bp
    from .products.routes import products_bp
    from .stats.routes import stats_bp
    from .user.routes import user_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(products_bp)
    app.register_blueprint(stats_bp)
    app.register_blueprint(user_bp)

    # Initialize database
    from .models import init_db
    with app.app_context():
        init_db()

    return app

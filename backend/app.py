from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from datetime import timedelta
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
bcrypt = Bcrypt()

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///loan_management.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-string')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
    
    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)
    CORS(app, origins=["http://localhost:3000"])
    
    # Import models
    from models import User, Loan, Transaction, Saving, Payment
    
    # Import and register blueprints
    from routes.auth import auth_bp
    from routes.users import users_bp
    from routes.loans import loans_bp
    from routes.transactions import transactions_bp
    from routes.payments import payments_bp
    from routes.savings import savings_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(loans_bp, url_prefix='/api/loans')
    app.register_blueprint(transactions_bp, url_prefix='/api/transactions')
    app.register_blueprint(payments_bp, url_prefix='/api/payments')
    app.register_blueprint(savings_bp, url_prefix='/api/savings')
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'message': 'Resource not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'message': 'Internal server error'}), 500
    
    # Health check endpoint
    @app.route('/api/health')
    def health_check():
        return jsonify({'status': 'healthy', 'message': 'Loan Management API is running'})
    
    return app

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000)
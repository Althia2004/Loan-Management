# backend/app.py
from flask import Flask, jsonify
from flask_cors import CORS
from datetime import timedelta
import os
from dotenv import load_dotenv

# ✅ import extensions
from extensions import db, migrate, jwt, bcrypt



def create_app():
    app = Flask(__name__, static_folder='static', static_url_path='/static')
    load_dotenv()

    # Config
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///loan_management.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-string')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
    
    # File upload config
    app.config['UPLOAD_FOLDER'] = 'static'
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

    # Init extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)
    
    # Enhanced CORS configuration
    CORS(app, 
         origins=["http://localhost:3000", "http://127.0.0.1:3000"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         allow_headers=["Content-Type", "Authorization"],
         supports_credentials=True)

    # Import models AFTER db is initialized
    from models import User, Loan, Transaction, Saving, Payment
    from admin_models import Admin, AdminActivity

    # Register blueprints
    from routes.auth import auth_bp
    from routes.admin import admin_bp
    from routes.users import users_bp
    from routes.loans import loans_bp
    from routes.transactions import transactions_bp
    from routes.payments import payments_bp
    from routes.savings import savings_bp
    from routes.reports import reports_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(loans_bp, url_prefix='/api/loans')
    app.register_blueprint(transactions_bp, url_prefix='/api/transactions')
    app.register_blueprint(payments_bp, url_prefix='/api/payments')
    app.register_blueprint(savings_bp, url_prefix='/api/savings')
    app.register_blueprint(reports_bp, url_prefix='/api/admin/reports')

    # Health check
    @app.route('/api/health')
    def health_check():
        return jsonify({'status': 'healthy', 'message': 'Loan Management API is running'})

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)

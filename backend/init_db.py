"""
Database initialization script for automatic setup on deployment.
This runs automatically when the app starts for the first time.
No shell access needed!
"""

from extensions import db
from models import User, Loan, Transaction, Saving, Payment
from admin_models import Admin, AdminActivity
from flask_bcrypt import Bcrypt
import os

bcrypt = Bcrypt()

def init_database(app):
    """
    Initialize database with tables and default admin.
    This is called automatically on app startup.
    """
    with app.app_context():
        try:
            print("🔧 Initializing database...")
            
            # Create all tables
            db.create_all()
            print("✅ Database tables created successfully")
            
            # Check if admin already exists
            admin = Admin.query.filter_by(username='admin').first()
            
            if not admin:
                # Create default super admin
                admin = Admin(
                    username='admin',
                    email='admin@moneyglitch.com',
                    role='super_admin'
                )
                admin.password_hash = bcrypt.generate_password_hash('admin123').decode('utf-8')
                
                db.session.add(admin)
                db.session.commit()
                
                print("✅ Default admin created successfully!")
                print("   Username: admin")
                print("   Password: admin123")
                print("   ⚠️  IMPORTANT: Change this password after first login!")
            else:
                print("ℹ️  Admin account already exists")
            
            print("🎉 Database initialization complete!")
            return True
            
        except Exception as e:
            print(f"❌ Database initialization error: {str(e)}")
            import traceback
            traceback.print_exc()
            return False

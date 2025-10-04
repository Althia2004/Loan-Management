import os
import sys
sys.path.append(os.getcwd())

from app import create_app
from extensions import db
from admin_models import Admin
from flask_bcrypt import Bcrypt

print("=== LOAN MANAGEMENT COMPILATION CHECK ===\n")

app = create_app()
with app.app_context():
    print("1. Database Schema Check:")
    try:
        # Check if admin table exists
        with db.engine.connect() as connection:
            result = connection.execute(db.text("SELECT name FROM sqlite_master WHERE type='table' AND name='admins';"))
            admin_table = result.fetchone()
            if admin_table:
                print("   ✅ Admin table exists")
            else:
                print("   ❌ Admin table missing")
                
            # Check admin table columns
            result = connection.execute(db.text("PRAGMA table_info(admins);"))
            columns = result.fetchall()
            expected_columns = ['id', 'username', 'email', 'password_hash', 'created_at', 'is_active', 'last_login']
            actual_columns = [col[1] for col in columns]
            
            print(f"   Expected columns: {expected_columns}")
            print(f"   Actual columns: {actual_columns}")
            
            missing_columns = set(expected_columns) - set(actual_columns)
            if missing_columns:
                print(f"   ❌ Missing columns: {missing_columns}")
            else:
                print("   ✅ All required columns present")
                
    except Exception as e:
        print(f"   ❌ Database check failed: {e}")

    print("\n2. Admin Account Creation Test:")
    try:
        # Check if test admin exists
        existing_admin = Admin.query.filter_by(username='admin').first()
        if existing_admin:
            print("   ✅ Admin account already exists")
        else:
            print("   Creating new admin account...")
            
            # Create new admin
            bcrypt = Bcrypt()
            admin = Admin(
                username='admin',
                email='admin@loanmanagement.com',
                password_hash=bcrypt.generate_password_hash('admin123').decode('utf-8')
            )
            
            db.session.add(admin)
            db.session.commit()
            print("   ✅ Admin account created successfully")
            
    except Exception as e:
        print(f"   ❌ Admin creation failed: {e}")

    print("\n3. Authentication Test:")
    try:
        admin = Admin.query.filter_by(username='admin').first()
        if admin and admin.check_password('admin123'):
            print("   ✅ Admin authentication working")
        else:
            print("   ❌ Admin authentication failed")
    except Exception as e:
        print(f"   ❌ Authentication test failed: {e}")

print("\n=== COMPILATION STATUS ===")
print("Backend checks completed. Ready for next step.")
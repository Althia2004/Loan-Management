from app import create_app
from extensions import db
from admin_models import Admin
from flask_bcrypt import Bcrypt

print("=== ADMIN ACCOUNT RESET ===")

app = create_app()
with app.app_context():
    # Remove existing admin accounts
    Admin.query.delete()
    db.session.commit()
    print("✅ Cleared existing admin accounts")
    
    # Create new admin with proper bcrypt setup
    bcrypt = Bcrypt(app)
    new_admin = Admin(
        username='admin',
        email='admin@loanmanagement.com',
        first_name='System',
        last_name='Admin',
        password_hash=bcrypt.generate_password_hash('admin123').decode('utf-8')
    )
    
    db.session.add(new_admin)
    db.session.commit()
    print("✅ Created new admin account")
    
    # Test authentication
    admin = Admin.query.filter_by(username='admin').first()
    if admin and admin.check_password('admin123'):
        print("✅ Admin authentication test successful")
    else:
        print("❌ Admin authentication test failed")

print("=== ADMIN RESET COMPLETE ===")
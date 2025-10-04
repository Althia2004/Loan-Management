from app import create_app
from extensions import db
from admin_models import Admin

app = create_app()
with app.app_context():
    admin = Admin.query.filter_by(username='admin').first()
    if admin:
        print('=== TESTING ADMIN PASSWORD ===')
        test_passwords = ['admin123', 'adminfinal', 'admin', 'password', 'Admin123']
        for pwd in test_passwords:
            try:
                if admin.check_password(pwd):
                    print(f'✅ SUCCESS: Password is "{pwd}"')
                    print(f'✅ Use these credentials:')
                    print(f'   Username: admin')
                    print(f'   Password: {pwd}')
                    break
                else:
                    print(f'❌ Failed: {pwd}')
            except Exception as e:
                print(f'❌ Error testing {pwd}: {e}')
        else:
            print('❌ None of the test passwords worked')
            print('Creating new admin with known password...')
            
            # Reset password to known value
            from flask_bcrypt import Bcrypt
            bcrypt = Bcrypt(app)
            admin.password_hash = bcrypt.generate_password_hash('admin123').decode('utf-8')
            db.session.commit()
            print('✅ Password reset to: admin123')
    else:
        print('❌ Admin account not found')
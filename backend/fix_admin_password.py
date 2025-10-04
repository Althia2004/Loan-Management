from app import create_app
from extensions import db, bcrypt
from admin_models import Admin

app = create_app()
with app.app_context():
    print('=== FIXING ADMIN PASSWORD HASH ===')
    
    # Get the admin
    admin = Admin.query.filter_by(username='admin').first()
    if admin:
        print(f'Current password hash: {admin.password_hash[:50]}...')
        
        # Generate new password hash using the app's bcrypt instance
        new_password = 'admin123'
        admin.password_hash = bcrypt.generate_password_hash(new_password).decode('utf-8')
        
        print(f'New password hash: {admin.password_hash[:50]}...')
        
        # Save to database
        db.session.commit()
        print('✅ Password hash updated in database')
        
        # Test the new hash
        if admin.check_password(new_password):
            print('✅ Password verification successful')
            print(f'✅ Admin login credentials:')
            print(f'   Username: admin')
            print(f'   Password: admin123')
        else:
            print('❌ Password verification failed')
    else:
        print('❌ Admin not found')
from app import create_app
from extensions import db
from admin_models import Admin

app = create_app()
with app.app_context():
    print('=== CLEANING UP TEST ADMIN ACCOUNTS ===')
    
    # Remove test admin accounts (keep the main admin)
    test_admins = Admin.query.filter(Admin.username != 'admin').all()
    
    for admin in test_admins:
        print(f'Removing test admin: {admin.username} ({admin.email})')
        db.session.delete(admin)
    
    db.session.commit()
    print(f'✅ Removed {len(test_admins)} test admin accounts')
    
    # Show remaining admins
    remaining_admins = Admin.query.all()
    print(f'✅ {len(remaining_admins)} admin accounts remaining:')
    for admin in remaining_admins:
        print(f'  - {admin.username} ({admin.email})')
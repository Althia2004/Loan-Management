from app import create_app, db
from admin_models import Admin
from werkzeug.security import generate_password_hash

app = create_app()

with app.app_context():
    admin = Admin.query.filter_by(username='admin').first()
    if admin:
        admin.password_hash = generate_password_hash('admin123')
        db.session.commit()
        print("✅ Admin password reset to 'admin123'")
    else:
        print("❌ Admin not found")

#!/usr/bin/env python3
from models import User
from extensions import db
from app import create_app
from werkzeug.security import generate_password_hash

def reset_user_password():
    app = create_app()
    
    with app.app_context():
        # Find the test user
        user = User.query.filter_by(email='test@test.com').first()
        if not user:
            print("❌ User not found!")
            return
        
        # Update password to 'althia123'
        new_password = 'althia123'
        user.password_hash = generate_password_hash(new_password)
        
        db.session.commit()
        
        print("✅ Password updated successfully!")
        print(f"Email: {user.email}")
        print(f"New password: {new_password}")

if __name__ == '__main__':
    reset_user_password()
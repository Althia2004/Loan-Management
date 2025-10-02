#!/usr/bin/env python3
"""
Script to create an admin user for the loan management system
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from extensions import db
from admin_models import Admin, AdminRole
from werkzeug.security import generate_password_hash

def create_admin_user():
    app = create_app()
    
    with app.app_context():
        # Create tables if they don't exist
        db.create_all()
        
        # Check if admin already exists
        existing_admin = Admin.query.filter_by(username='admin').first()
        if existing_admin:
            print("❌ Admin user 'admin' already exists!")
            return
        
        # Create new admin user
        admin = Admin(
            username='admin',
            email='admin@admin.com',
            password_hash=generate_password_hash('adminfinal'),
            first_name='System',
            last_name='Administrator',
            role=AdminRole.SUPER_ADMIN
        )
        
        db.session.add(admin)
        db.session.commit()
        
        print("✅ Admin user created successfully!")
        print("📋 Login credentials:")
        print("   Username: admin")
        print("   Email: admin@admin.com")
        print("   Password: adminfinal")
        print("   Role: Super Admin")

if __name__ == '__main__':
    create_admin_user()
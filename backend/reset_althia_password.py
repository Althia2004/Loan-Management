#!/usr/bin/env python3
"""
Reset Althia's password for testing
"""

import sys
import os
sys.path.append(os.getcwd())

from app import create_app
from extensions import db
from models import User
from werkzeug.security import generate_password_hash

def reset_althia_password():
    app = create_app()
    
    with app.app_context():
        # Find Althia
        althia = User.query.filter(User.first_name.like('%Althia%')).first()
        if not althia:
            print("❌ Althia not found")
            return
        
        # Reset her password to something we know
        new_password = "althia123"
        althia.password_hash = generate_password_hash(new_password)
        
        db.session.commit()
        
        print(f"✅ Reset password for Althia:")
        print(f"   Email: {althia.email}")
        print(f"   Password: {new_password}")
        print("\nYou can now test with these credentials")

if __name__ == "__main__":
    reset_althia_password()
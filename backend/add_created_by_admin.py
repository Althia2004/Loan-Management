"""
Add created_by_admin field to users table
"""
from models import db, User
from admin_models import Admin
from extensions import db as db_ext
from flask import Flask
from app import create_app

app = create_app()

with app.app_context():
    try:
        # Check if column exists
        from sqlalchemy import inspect, text
        inspector = inspect(db.engine)
        columns = [col['name'] for col in inspector.get_columns('users')]
        
        if 'created_by_admin' not in columns:
            print("Adding created_by_admin column to users table...")
            with db.engine.connect() as conn:
                conn.execute(text('ALTER TABLE users ADD COLUMN created_by_admin INTEGER'))
                conn.commit()
            print("✓ Column added successfully")
            
            # Set a default admin for existing users (get first admin)
            first_admin = Admin.query.first()
            if first_admin:
                with db.engine.connect() as conn:
                    conn.execute(text(f'UPDATE users SET created_by_admin = {first_admin.id} WHERE created_by_admin IS NULL'))
                    conn.commit()
                print(f"✓ Set default admin ({first_admin.username}) for existing users")
        else:
            print("✓ created_by_admin column already exists")
            
        print("\n✅ Migration completed successfully!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

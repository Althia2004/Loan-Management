from extensions import db
from sqlalchemy import text

def add_admin_settings_columns():
    """Add new columns for admin settings functionality"""
    try:
        # Add new columns if they don't exist
        db.session.execute(text('ALTER TABLE admins ADD COLUMN name VARCHAR(100)'))
        db.session.commit()
        print("Added 'name' column to admins table")
    except Exception as e:
        print(f"Column 'name' might already exist: {e}")
    
    try:
        db.session.execute(text('ALTER TABLE admins ADD COLUMN image_url VARCHAR(200)'))
        db.session.commit()
        print("Added 'image_url' column to admins table")
    except Exception as e:
        print(f"Column 'image_url' might already exist: {e}")
    
    try:
        db.session.execute(text('ALTER TABLE admins ADD COLUMN created_by INTEGER REFERENCES admins(id)'))
        db.session.commit()
        print("Added 'created_by' column to admins table")
    except Exception as e:
        print(f"Column 'created_by' might already exist: {e}")
    
    # Update existing admins to have a name field
    try:
        from admin_models import Admin
        admins = Admin.query.all()
        for admin in admins:
            if not hasattr(admin, 'name') or not admin.name:
                # Use raw SQL to update the name field
                db.session.execute(
                    text("UPDATE admins SET name = :name WHERE id = :id"),
                    {"name": f"{admin.first_name} {admin.last_name}", "id": admin.id}
                )
        db.session.commit()
        print("Updated existing admin names")
    except Exception as e:
        print(f"Error updating admin names: {e}")

if __name__ == '__main__':
    from app import create_app
    app = create_app()
    
    with app.app_context():
        add_admin_settings_columns()
        print("Admin settings columns migration completed!")
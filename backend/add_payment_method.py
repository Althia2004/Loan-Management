"""
Add payment_method field to Payment model
"""
from extensions import db
from sqlalchemy import text

def upgrade():
    """Add payment_method column to payments table"""
    with db.engine.connect() as conn:
        # Add payment_method column (default 'manual')
        conn.execute(text("""
            ALTER TABLE payments 
            ADD COLUMN payment_method VARCHAR(50) DEFAULT 'manual'
        """))
        conn.commit()
        print("✅ Added payment_method column to payments table")

if __name__ == '__main__':
    from app import create_app
    app = create_app()
    
    with app.app_context():
        print("Adding payment_method field to Payment model...")
        upgrade()
        print("Migration completed successfully!")

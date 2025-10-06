"""
Create a test user for testing the delete functionality
"""

from extensions import db
from models import User
from app import create_app
from werkzeug.security import generate_password_hash

def create_test_user():
    """Create a test user for deletion testing"""
    app = create_app()
    
    with app.app_context():
        try:
            # Create test user
            test_user = User(
                first_name="Test",
                last_name="User",
                email="testuser@example.com",
                contact_number="09123456789",
                password=generate_password_hash("password123"),
                capital_share=25000.00  # Regular member
            )
            
            db.session.add(test_user)
            db.session.commit()
            
            print(f"Test user created successfully:")
            print(f"  ID: {test_user.id}")
            print(f"  Name: {test_user.first_name} {test_user.last_name}")
            print(f"  Email: {test_user.email}")
            print(f"  Capital Share: ₱{test_user.capital_share:,.2f}")
            print(f"  Status: {test_user.member_status}")
            
        except Exception as e:
            print(f"Error creating test user: {e}")
            db.session.rollback()

if __name__ == "__main__":
    create_test_user()
"""
Create a test user with an active loan for testing the dropdown
"""

from extensions import db
from models import User, Loan, LoanStatus, LoanType
from app import create_app
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta

def create_test_user_with_loan():
    """Create a test user with an active loan"""
    app = create_app()
    
    with app.app_context():
        try:
            # Create test user
            test_user = User(
                first_name="Test",
                last_name="UserWithLoan",
                email="testwithloan@example.com",
                contact_number="09123456789",
                password_hash=generate_password_hash("password123"),
                capital_share=25000.00  # Regular member
            )
            
            db.session.add(test_user)
            db.session.flush()  # Get the user ID
            
            # Create an active loan for this user
            test_loan = Loan(
                user_id=test_user.id,
                principal_amount=50000.00,
                interest_rate=5.0,
                duration_months=12,
                monthly_payment=4500.00,
                remaining_balance=45000.00,
                status=LoanStatus.ACTIVE,
                purpose="Testing loan deletion with reason",
                loan_type=LoanType.PERSONAL,
                created_at=datetime.utcnow(),
                approved_at=datetime.utcnow(),
                due_date=datetime.utcnow() + timedelta(days=30)
            )
            
            db.session.add(test_loan)
            db.session.commit()
            
            print(f"✅ Test user created successfully:")
            print(f"  User ID: {test_user.id}")
            print(f"  Name: {test_user.first_name} {test_user.last_name}")
            print(f"  Email: {test_user.email}")
            print(f"  Capital Share: ₱{test_user.capital_share:,.2f}")
            print(f"  Status: {test_user.member_status}")
            
            print(f"\n✅ Test loan created successfully:")
            print(f"  Loan ID: {test_loan.id}")
            print(f"  Principal: ₱{test_loan.principal_amount:,.2f}")
            print(f"  Status: {test_loan.status.value}")
            print(f"  Monthly Payment: ₱{test_loan.monthly_payment:,.2f}")
            
        except Exception as e:
            print(f"❌ Error creating test user: {e}")
            db.session.rollback()

if __name__ == "__main__":
    create_test_user_with_loan()
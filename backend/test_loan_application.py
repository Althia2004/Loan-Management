"""
Test the loan application API to see if it's working
"""

from extensions import db
from models import User, Loan
from app import create_app
import json

def test_loan_application():
    """Test loan application functionality"""
    app = create_app()
    
    with app.app_context():
        try:
            # Find a user to test with
            users = User.query.all()
            print(f"Available users:")
            for user in users:
                print(f"  - {user.first_name} {user.last_name} (ID: {user.id}, Capital: ₱{user.capital_share:,.2f}, Eligible: {user.loan_eligibility})")
            
            if not users:
                print("❌ No users found!")
                return
            
            # Check existing loans
            loans = Loan.query.all()
            print(f"\nExisting loans ({len(loans)} total):")
            for loan in loans:
                print(f"  - Loan {loan.id}: User {loan.user_id}, Amount: ₱{loan.principal_amount:,.2f}, Status: {loan.status.value}")
            
            # Find an eligible user
            eligible_user = None
            for user in users:
                if user.loan_eligibility:
                    eligible_user = user
                    break
            
            if not eligible_user:
                print("\n❌ No eligible users found!")
                return
            
            print(f"\n✅ Found eligible user: {eligible_user.first_name} {eligible_user.last_name}")
            print(f"   Capital Share: ₱{eligible_user.capital_share:,.2f}")
            print(f"   Loan Eligibility: {eligible_user.loan_eligibility}")
            
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_loan_application()
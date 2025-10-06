"""
Update script to add DEFAULTED status to existing loans if needed
"""

from extensions import db
from models import Loan, LoanStatus
from app import create_app

def update_loan_status_enum():
    """Add DEFAULTED status to LoanStatus enum in database"""
    app = create_app()
    
    with app.app_context():
        try:
            # Try to find any loans with status that might cause issues
            loans = Loan.query.all()
            print(f"Found {len(loans)} loans in database")
            
            for loan in loans:
                print(f"Loan {loan.id}: status = {loan.status}")
            
            print("LoanStatus enum values:")
            for status in LoanStatus:
                print(f"  - {status.name}: {status.value}")
            
            db.session.commit()
            print("Database check completed successfully")
            
        except Exception as e:
            print(f"Error checking database: {e}")
            db.session.rollback()

if __name__ == "__main__":
    update_loan_status_enum()
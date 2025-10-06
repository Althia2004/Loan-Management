"""
Diagnostic script to check John Doe's data relationships
"""

from extensions import db
from models import User, Loan, Transaction, Saving, Payment, Penalty
from app import create_app

def check_john_doe_data():
    """Check what data John Doe has that might cause deletion issues"""
    app = create_app()
    
    with app.app_context():
        try:
            # Find John Doe
            john_doe = User.query.filter(
                (User.first_name == 'John') & (User.last_name == 'Doe')
            ).first()
            
            if not john_doe:
                print("John Doe not found in database")
                return
            
            print(f"=== JOHN DOE DATA ANALYSIS ===")
            print(f"User ID: {john_doe.id}")
            print(f"Name: {john_doe.first_name} {john_doe.last_name}")
            print(f"Email: {john_doe.email}")
            print(f"Capital Share: ₱{john_doe.capital_share:,.2f}")
            
            # Check loans
            loans = Loan.query.filter_by(user_id=john_doe.id).all()
            print(f"\nLOANS ({len(loans)} total):")
            for loan in loans:
                print(f"  - Loan {loan.id}: {loan.status.value}, Amount: ₱{loan.principal_amount:,.2f}")
                
                # Check penalties for each loan
                penalties = Penalty.query.filter_by(loan_id=loan.id).all()
                print(f"    Penalties: {len(penalties)} total")
                for penalty in penalties:
                    print(f"      - Penalty {penalty.id}: ₱{penalty.amount:,.2f}")
            
            # Check transactions
            transactions = Transaction.query.filter_by(user_id=john_doe.id).all()
            print(f"\nTRANSACTIONS ({len(transactions)} total):")
            for txn in transactions:
                print(f"  - Transaction {txn.id}: {txn.type}, Amount: ₱{txn.amount:,.2f}")
            
            # Check savings
            savings = Saving.query.filter_by(user_id=john_doe.id).all()
            print(f"\nSAVINGS ({len(savings)} total):")
            for saving in savings:
                print(f"  - Saving {saving.id}: ₱{saving.amount:,.2f}")
            
            # Check payments
            payments = Payment.query.filter_by(user_id=john_doe.id).all()
            print(f"\nPAYMENTS ({len(payments)} total):")
            for payment in payments:
                print(f"  - Payment {payment.id}: ₱{payment.amount:,.2f}, Loan: {payment.loan_id}")
                
        except Exception as e:
            print(f"Error analyzing John Doe's data: {e}")
            import traceback
            print(f"Full traceback: {traceback.format_exc()}")

if __name__ == "__main__":
    check_john_doe_data()
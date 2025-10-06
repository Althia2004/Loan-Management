"""
Delete John Doe directly via terminal to test backend logic
"""

from extensions import db
from models import User, Loan, Transaction, Saving, Payment, Penalty, LoanStatus
from app import create_app

def delete_john_doe_directly():
    """Delete John Doe using the same logic as the API endpoint"""
    app = create_app()
    
    with app.app_context():
        try:
            # Find John Doe
            john_doe = User.query.filter(
                (User.first_name == 'John') & (User.last_name == 'Doe')
            ).first()
            
            if not john_doe:
                print("John Doe not found!")
                return
            
            user_id = john_doe.id
            user_name = f"{john_doe.first_name} {john_doe.last_name}"
            
            print(f"=== DELETING {user_name} (ID: {user_id}) ===")
            
            # Disable foreign key constraints
            from sqlalchemy import text
            db.session.execute(text('PRAGMA foreign_keys=OFF'))
            print("Foreign key constraints disabled")
            
            # Check ALL loans (not just active ones)
            all_loans = Loan.query.filter_by(user_id=user_id).all()
            print(f"Found {len(all_loans)} total loans")
            
            # For now, just delete the loans entirely since the constraint prevents NULL user_id
            loans_action_taken = []
            if all_loans:
                for loan in all_loans:
                    print(f"  - Found loan {loan.id} with status {loan.status}")
                    # Delete the loan since we can't set user_id to NULL with current schema
                    db.session.delete(loan)
                    loans_action_taken.append(f"Loan #{loan.id} deleted")
                    print(f"  - Deleted loan {loan.id}")
            
            # Delete penalties first
            penalties = Penalty.query.join(Loan).filter(Loan.user_id == user_id).all()
            print(f"Found {len(penalties)} penalties to delete")
            for penalty in penalties:
                db.session.delete(penalty)
                print(f"  - Deleted penalty {penalty.id}")
            
            # Delete payments individually
            user_payments = Payment.query.filter_by(user_id=user_id).all()
            print(f"Found {len(user_payments)} payments to delete")
            for payment in user_payments:
                db.session.delete(payment)
                print(f"  - Deleted payment {payment.id}")
            
            # Delete transactions
            transactions = Transaction.query.filter_by(user_id=user_id).all()
            print(f"Found {len(transactions)} transactions to delete")
            Transaction.query.filter_by(user_id=user_id).delete()
            
            # Delete savings
            savings = Saving.query.filter_by(user_id=user_id).all()
            print(f"Found {len(savings)} savings to delete")
            Saving.query.filter_by(user_id=user_id).delete()
            
            print("About to commit related record deletions...")
            db.session.commit()
            print("Related records deleted successfully")
            
            # Finally delete user
            print("About to delete user...")
            db.session.delete(john_doe)
            print("User deletion staged")
            
            print("About to commit user deletion...")
            db.session.commit()
            print("User deleted successfully")
            
            # Re-enable foreign key constraints
            db.session.execute(text('PRAGMA foreign_keys=ON'))
            print("Foreign key constraints re-enabled")
            
            print(f"✅ SUCCESS: {user_name} deleted successfully!")
            if all_loans:
                print(f"   - {len(all_loans)} loan(s) were handled: {loans_action_taken}")
            
        except Exception as e:
            print(f"❌ ERROR: {str(e)}")
            import traceback
            print(f"Full traceback:")
            print(traceback.format_exc())
            db.session.rollback()
            # Re-enable foreign key constraints even on error
            try:
                from sqlalchemy import text
                db.session.execute(text('PRAGMA foreign_keys=ON'))
            except:
                pass

if __name__ == "__main__":
    delete_john_doe_directly()
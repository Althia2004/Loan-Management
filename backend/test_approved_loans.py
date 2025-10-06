from models import *
from extensions import db
from flask import Flask
from app import create_app

app = create_app()

with app.app_context():
    user = User.query.get(5)
    print(f"\n=== Testing Approved Loans for {user.first_name} {user.last_name} ===\n")
    
    # Get all loans
    all_loans = Loan.query.filter_by(user_id=5).all()
    print(f"Total loans: {len(all_loans)}")
    for loan in all_loans:
        print(f"  - ID: {loan.id}, Status: {loan.status.value}, Amount: ₱{loan.principal_amount:,.2f}")
    
    # Get only approved/active loans
    approved_loans = [l for l in all_loans if l.status.value in ['approved', 'active']]
    print(f"\nApproved/Active loans: {len(approved_loans)}")
    for loan in approved_loans:
        print(f"  - ID: {loan.id}, Status: {loan.status.value}, Amount: ₱{loan.principal_amount:,.2f}")
        print(f"    Type: {loan.loan_type}")
        print(f"    Created: {loan.created_at}")
        print(f"    Remaining: ₱{loan.remaining_balance:,.2f}")

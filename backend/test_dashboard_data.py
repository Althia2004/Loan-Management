from models import *
from extensions import db
from flask import Flask
from app import create_app

app = create_app()

with app.app_context():
    user = User.query.get(5)
    print(f"\n=== Testing Dashboard Data for User {user.first_name} {user.last_name} ===\n")
    
    # Get loans with APPROVED or ACTIVE status
    loans = Loan.query.filter(
        Loan.user_id == 5,
        Loan.status.in_([LoanStatus.APPROVED, LoanStatus.ACTIVE])
    ).all()
    
    print(f"Found {len(loans)} active/approved loans:")
    for loan in loans:
        print(f"  - ID: {loan.id}")
        print(f"    Status: {loan.status.value}")
        print(f"    Type: {loan.loan_type}")
        print(f"    Principal: ₱{loan.principal_amount:,.2f}")
        print(f"    Remaining: ₱{loan.remaining_balance:,.2f}")
        print(f"    Monthly Payment: ₱{loan.monthly_payment:,.2f}")
        print()
    
    total_principal = sum(l.principal_amount for l in loans)
    total_remaining = sum(l.remaining_balance for l in loans)
    total_monthly = sum(l.monthly_payment for l in loans)
    
    print(f"Totals:")
    print(f"  Total Principal: ₱{total_principal:,.2f}")
    print(f"  Total Remaining: ₱{total_remaining:,.2f}")
    print(f"  Total Monthly Payment: ₱{total_monthly:,.2f}")

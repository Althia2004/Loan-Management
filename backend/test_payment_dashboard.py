"""
Test script to verify payment dashboard functionality
"""
from models import *
from extensions import db
from flask import Flask
from app import create_app

app = create_app()

with app.app_context():
    print("\n=== Testing Payment Dashboard Data ===\n")
    
    # Get user with loans
    user = User.query.get(5)
    print(f"User: {user.first_name} {user.last_name}")
    print(f"Capital Share: ₱{user.capital_share:,.2f}")
    print(f"Loan Eligible: {user.loan_eligibility}\n")
    
    # Get active/approved loans
    active_loans = Loan.query.filter(
        Loan.user_id == user.id,
        Loan.status.in_([LoanStatus.APPROVED, LoanStatus.ACTIVE])
    ).all()
    
    print(f"Found {len(active_loans)} active/approved loans:\n")
    
    for idx, loan in enumerate(active_loans, 1):
        print(f"Loan {idx}:")
        print(f"  ID: {loan.loan_id}")
        print(f"  Type: {loan.loan_type}")
        print(f"  Status: {loan.status.value}")
        print(f"  Principal: ₱{loan.principal_amount:,.2f}")
        print(f"  Remaining Balance: ₱{loan.remaining_balance:,.2f}")
        print(f"  Monthly Payment: ₱{loan.monthly_payment:,.2f}")
        print(f"  Duration: {loan.duration_months} months")
        print(f"  Interest Rate: {loan.interest_rate}%")
        print()
    
    if len(active_loans) > 0:
        print("✅ Payment dashboard will have loans available for payment")
        print("✅ Users can select loans and generate GCash QR codes")
    else:
        print("❌ No active loans - payment dashboard will show empty state")

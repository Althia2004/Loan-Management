from models import *
from extensions import db
from flask import Flask
from app import create_app

app = create_app()

with app.app_context():
    # Test for user ID 5 (Althia)
    user_id = 5
    user = User.query.get(user_id)
    
    print(f"\n=== Transaction Test for {user.first_name} {user.last_name} (ID: {user_id}) ===\n")
    
    # 1. Regular transactions
    transactions = Transaction.query.filter_by(user_id=user_id).all()
    print(f"Regular Transactions: {len(transactions)}")
    for t in transactions:
        print(f"  - {t.transaction_id}: {t.transaction_type.value} - ₱{t.amount:,.2f}")
    
    # 2. Loan payments
    payments = Payment.query.filter_by(user_id=user_id).all()
    print(f"\nLoan Payments: {len(payments)}")
    for p in payments:
        print(f"  - {p.payment_id}: Loan #{p.loan_id} - ₱{p.amount:,.2f} ({p.status})")
    
    # 3. Savings
    savings = Saving.query.filter_by(user_id=user_id).all()
    print(f"\nSavings Transactions: {len(savings)}")
    for s in savings:
        trans_type = "Deposit" if s.amount > 0 else "Withdrawal"
        print(f"  - SAV-{s.id}: {trans_type} - ₱{abs(s.amount):,.2f} (Balance: ₱{s.balance:,.2f})")
    
    # 4. Loan disbursements
    loans = Loan.query.filter_by(user_id=user_id).all()
    approved_loans = [l for l in loans if l.approved_at]
    print(f"\nLoan Disbursements: {len(approved_loans)}")
    for l in approved_loans:
        print(f"  - {l.loan_id}: {l.loan_type.value} - ₱{l.principal_amount:,.2f} ({l.status.value})")
    
    # 5. Penalties
    penalties = Penalty.query.filter_by(user_id=user_id).all()
    print(f"\nPenalties: {len(penalties)}")
    for p in penalties:
        print(f"  - {p.penalty_id}: Loan #{p.loan_id} - ₱{p.amount:,.2f} ({p.days_overdue} days)")
    
    # Total count
    total = len(transactions) + len(payments) + len(savings) + len(approved_loans) + len(penalties) + 1  # +1 for account creation
    print(f"\n=== Total Transactions: {total} ===\n")

#!/usr/bin/env python3
"""
Script to create a pending loan for testing admin approve/reject functionality
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from extensions import db
from models import User, Loan, LoanStatus
from datetime import datetime
import uuid

def create_pending_loan():
    app = create_app()
    
    with app.app_context():
        # Find the test user
        user = User.query.filter_by(email='test@test.com').first()
        if not user:
            print("❌ Test user not found. Please create a user first.")
            return
        
        # Create a pending loan
        principal_amount = 50000.00
        monthly_payment = (principal_amount * (1 + 0.05)) / 12  # Simple calculation
        
        loan = Loan(
            loan_id=f"LOAN{datetime.now().strftime('%Y%m%d%H%M%S')}",
            user_id=user.id,
            principal_amount=principal_amount,
            interest_rate=5.0,  # 5% monthly
            duration_months=12,
            monthly_payment=monthly_payment,
            remaining_balance=principal_amount * (1 + 0.05),  # Principal + interest
            purpose="Business expansion",
            status=LoanStatus.PENDING,
            created_at=datetime.utcnow()
        )
        
        db.session.add(loan)
        db.session.commit()
        
        print("✅ Pending loan created successfully!")
        print(f"📋 Loan details:")
        print(f"   Loan ID: {loan.loan_id}")
        print(f"   User: {user.first_name} {user.last_name}")
        print(f"   Amount: ₱{loan.principal_amount:,.2f}")
        print(f"   Duration: {loan.duration_months} months")
        print(f"   Status: {loan.status.value}")
        print(f"   Purpose: {loan.purpose}")

if __name__ == '__main__':
    create_pending_loan()
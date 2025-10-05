#!/usr/bin/env python3
"""
Create sample payment data for testing the payment history chart
"""

import sys
import os
sys.path.append(os.getcwd())

from app import create_app
from extensions import db
from models import User, Loan, Payment, LoanStatus, LoanType
from datetime import datetime, timedelta
import random

def create_sample_data():
    app = create_app()
    
    with app.app_context():
        # Get the first user
        user = User.query.first()
        if not user:
            print("❌ No users found. Please create a user first.")
            return
        
        print(f"Creating sample data for user: {user.first_name} {user.last_name}")
        
        # Check if user has loans, if not create one
        existing_loan = Loan.query.filter_by(user_id=user.id).first()
        if not existing_loan:
            print("Creating sample loan...")
            sample_loan = Loan(
                user_id=user.id,
                loan_type=LoanType.PERSONAL,
                principal_amount=100000.0,
                remaining_balance=60000.0,
                interest_rate=5.0,
                monthly_payment=5000.0,
                duration_months=24,
                status=LoanStatus.ACTIVE,
                created_at=datetime.utcnow() - timedelta(days=180),
                approved_at=datetime.utcnow() - timedelta(days=170),
                due_date=datetime.utcnow() + timedelta(days=30)
            )
            db.session.add(sample_loan)
            db.session.commit()
            print("✅ Sample loan created")
            existing_loan = sample_loan
        
        # Create payment history for the last 8 months
        current_date = datetime.utcnow()
        payments_created = 0
        
        for i in range(8, 0, -1):  # Last 8 months
            # Create 1-2 payments per month
            num_payments = random.randint(1, 2)
            
            for j in range(num_payments):
                payment_date = current_date - timedelta(days=i*30 + random.randint(1, 28))
                payment_amount = random.uniform(2000, 8000)  # Random payment between 2k-8k
                
                # Check if payment already exists for this date range
                existing_payment = Payment.query.filter(
                    Payment.user_id == user.id,
                    Payment.payment_date >= payment_date - timedelta(days=1),
                    Payment.payment_date <= payment_date + timedelta(days=1)
                ).first()
                
                if not existing_payment:
                    payment = Payment(
                        user_id=user.id,
                        loan_id=existing_loan.id,
                        amount=payment_amount,
                        payment_date=payment_date,
                        status='completed'
                    )
                    db.session.add(payment)
                    payments_created += 1
        
        db.session.commit()
        
        print(f"✅ Created {payments_created} sample payments")
        
        # Show payment summary
        payments = Payment.query.filter_by(user_id=user.id).order_by(Payment.payment_date.desc()).all()
        print(f"✅ Total payments in database: {len(payments)}")
        
        if payments:
            print("\nRecent payments:")
            for payment in payments[:5]:
                print(f"  {payment.payment_date.strftime('%Y-%m-%d')}: ₱{payment.amount:,.2f}")
        
        print("\n🎉 Sample payment data created successfully!")
        print("You can now see the payment history in the dashboard chart.")

if __name__ == "__main__":
    create_sample_data()
#!/usr/bin/env python3
"""
Create overdue loans to test the penalty system
"""

import sys
import os
sys.path.append(os.getcwd())

from app import create_app
from extensions import db
from models import User, Loan, LoanStatus
from datetime import datetime, timedelta

def create_overdue_loans():
    app = create_app()
    
    with app.app_context():
        # Get all active loans
        active_loans = Loan.query.filter_by(status=LoanStatus.ACTIVE).all()
        
        if not active_loans:
            print("❌ No active loans found")
            return
        
        print(f"Found {len(active_loans)} active loans")
        
        # Make some loans overdue for testing
        current_date = datetime.utcnow()
        updated_loans = 0
        
        for i, loan in enumerate(active_loans):
            # Make every other loan overdue by different amounts
            if i % 2 == 0:
                # Some loans overdue by 35 days (1 penalty period + 5 days)
                overdue_days = 35
                loan.due_date = current_date - timedelta(days=overdue_days)
                updated_loans += 1
                print(f"✅ Made loan #{loan.id} overdue by {overdue_days} days")
            elif i % 3 == 0:
                # Some loans overdue by 65 days (2 penalty periods + 5 days)
                overdue_days = 65
                loan.due_date = current_date - timedelta(days=overdue_days)
                updated_loans += 1
                print(f"✅ Made loan #{loan.id} overdue by {overdue_days} days")
        
        db.session.commit()
        
        print(f"\n🎉 Updated {updated_loans} loans to be overdue")
        print("Now you can test the penalty system in the dashboard!")
        
        # Show penalty calculations
        print("\nPenalty Calculations:")
        for loan in Loan.query.filter_by(status=LoanStatus.ACTIVE).all():
            if loan.is_overdue():
                penalty = loan.calculate_penalty()
                days_overdue = loan.get_days_overdue()
                print(f"  Loan #{loan.id}: {days_overdue} days overdue = ₱{penalty:,.2f} penalty")

if __name__ == "__main__":
    create_overdue_loans()
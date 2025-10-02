#!/usr/bin/env python3
"""
Script to update existing approved loans with due dates
"""

import sys
import os

# Add the parent directory to the path so we can import from the app
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from extensions import db
from models import Loan
from datetime import datetime

def update_loan_due_dates():
    """Update due dates for existing approved loans"""
    app = create_app()
    with app.app_context():
        try:
            # Get all approved loans without due dates
            loans = Loan.query.filter(
                Loan.status.in_(['APPROVED', 'ACTIVE']),
                Loan.approved_at.isnot(None),
                Loan.due_date.is_(None)
            ).all()
            
            print(f"Found {len(loans)} loans to update with due dates...")
            
            for loan in loans:
                if loan.approved_at:
                    # Calculate due date
                    year = loan.approved_at.year
                    month = loan.approved_at.month + loan.duration_months
                    
                    # Handle month overflow
                    while month > 12:
                        month -= 12
                        year += 1
                    
                    loan.due_date = loan.approved_at.replace(year=year, month=month)
                    print(f"Updated loan {loan.loan_id} with due date: {loan.due_date}")
            
            db.session.commit()
            print(f"Successfully updated {len(loans)} loans with due dates!")
            
        except Exception as e:
            print(f"Error updating loan due dates: {str(e)}")
            db.session.rollback()

if __name__ == '__main__':
    update_loan_due_dates()
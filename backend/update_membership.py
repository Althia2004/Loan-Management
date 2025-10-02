#!/usr/bin/env python3
"""
Script to update existing users' membership status based on capital share
"""

from app import create_app
from extensions import db
from models import User

def update_all_users_membership():
    app = create_app()
    
    with app.app_context():
        try:
            # Get all users
            users = User.query.all()
            
            print(f"Found {len(users)} users to update...")
            
            updated_count = 0
            for user in users:
                old_status = user.member_status
                old_eligibility = user.loan_eligibility
                
                # Update membership status based on capital share
                user.update_membership_status()
                
                if old_status != user.member_status or old_eligibility != user.loan_eligibility:
                    print(f"Updated user {user.first_name} {user.last_name}:")
                    print(f"  Capital Share: {user.capital_share}")
                    print(f"  Status: {old_status} -> {user.member_status}")
                    print(f"  Loan Eligible: {old_eligibility} -> {user.loan_eligibility}")
                    updated_count += 1
            
            db.session.commit()
            print(f"\nSuccessfully updated {updated_count} users!")
            print("\nMembership Rules:")
            print("- Capital Share >= 20,000 PHP: REGULAR MEMBER (Loan Eligible)")
            print("- Capital Share < 20,000 PHP: MEMBER (Not Loan Eligible)")
            
        except Exception as e:
            db.session.rollback()
            print(f"Error updating users: {e}")

if __name__ == "__main__":
    update_all_users_membership()
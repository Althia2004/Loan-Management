"""
Test the updated accounts/profile page data
"""
from models import *
from admin_models import Admin
from app import create_app

app = create_app()

with app.app_context():
    print("\n=== Testing Account Profile Data ===\n")
    
    # Get user
    user = User.query.filter_by(email='althiadiscaya@gmail.com').first()
    
    if user:
        print(f"User: {user.first_name} {user.last_name}")
        print(f"Email: {user.email}")
        print(f"Contact: {user.contact_number}")
        print(f"Capital Share: ₱{user.capital_share:,.2f}")
        print(f"Member Status: {user.member_status}")
        print(f"Loan Eligibility: {user.loan_eligibility}")
        print(f"Created At: {user.created_at}")
        print(f"Updated At: {user.updated_at}")
        
        if user.created_by_admin:
            admin = Admin.query.get(user.created_by_admin)
            if admin:
                print(f"Created By Admin: {admin.username} ({admin.email})")
        else:
            print("Created By Admin: Not set")
        
        print(f"\n--- User Loans ---")
        loans = Loan.query.filter_by(user_id=user.id).all()
        print(f"Total Loans: {len(loans)}")
        
        for i, loan in enumerate(loans, 1):
            print(f"\n{i}. Loan ID: {loan.loan_id}")
            print(f"   Status: {loan.status.value}")
            print(f"   Type: {loan.loan_type.value if loan.loan_type else 'N/A'}")
            print(f"   Principal: ₱{loan.principal_amount:,.2f}")
            print(f"   Remaining: ₱{loan.remaining_balance:,.2f}")
            print(f"   Monthly Payment: ₱{loan.monthly_payment:,.2f}")
            print(f"   Created: {loan.created_at}")
            if loan.approved_at:
                print(f"   Approved: {loan.approved_at}")
        
        print(f"\n--- Payment History ---")
        payments = Payment.query.filter_by(user_id=user.id).all()
        print(f"Total Payments: {len(payments)}")
        
        for payment in payments[:5]:  # Show last 5
            print(f"- {payment.payment_date}: ₱{payment.amount:,.2f} ({payment.status})")
        
        print(f"\n--- User Dict (API Response) ---")
        import json
        print(json.dumps(user.to_dict(), indent=2))
        
    else:
        print("❌ User not found!")

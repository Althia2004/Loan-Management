#!/usr/bin/env python3
"""
Test the penalties system by making API calls
"""

import requests
import json

def test_penalties_system():
    try:
        # First, login to get a token
        login_url = 'http://localhost:5000/api/auth/login'
        login_data = {
            'email': 'test@example.com',  # Default user from sample data
            'password': 'password123'
        }
        
        print("=== TESTING PENALTIES SYSTEM ===")
        print("1. Logging in...")
        
        login_response = requests.post(login_url, json=login_data)
        if login_response.status_code != 200:
            print(f"❌ Login failed: {login_response.text}")
            return
        
        token = login_response.json()['access_token']
        print("✅ Login successful")
        
        # Test dashboard API
        dashboard_url = 'http://localhost:5000/api/users/dashboard'
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
        
        print("2. Fetching dashboard data...")
        
        dashboard_response = requests.get(dashboard_url, headers=headers)
        
        if dashboard_response.status_code != 200:
            print(f"❌ Dashboard API failed: {dashboard_response.text}")
            return
        
        data = dashboard_response.json()
        print("✅ Dashboard API successful")
        
        # Check penalties data
        print("\n=== PENALTIES INFORMATION ===")
        print(f"Total Penalties: ₱{data.get('total_penalties', 0):,.2f}")
        
        overdue_loans = data.get('overdue_loans', [])
        print(f"Overdue Loans: {len(overdue_loans)}")
        
        if overdue_loans:
            print("\nOverdue Loan Details:")
            for i, loan_data in enumerate(overdue_loans, 1):
                print(f"  {i}. Loan #{loan_data['loan_id']}")
                print(f"     Days Overdue: {loan_data['days_overdue']}")
                print(f"     Monthly Payment: ₱{loan_data['monthly_payment']:,.2f}")
                print(f"     Penalty Amount: ₱{loan_data['penalty_amount']:,.2f}")
                print(f"     Due Date: {loan_data['due_date']}")
                print()
        else:
            print("No overdue loans found")
        
        # Active loans info
        active_loans = data.get('active_loans', [])
        print(f"Active Loans: {len(active_loans)}")
        
        if active_loans:
            print("\nActive Loan Details:")
            for loan in active_loans:
                print(f"  Loan #{loan['id']}")
                print(f"    Principal: ₱{loan['principal_amount']:,.2f}")
                print(f"    Remaining: ₱{loan['remaining_balance']:,.2f}")
                print(f"    Monthly Payment: ₱{loan['monthly_payment']:,.2f}")
                print(f"    Due Date: {loan.get('due_date', 'Not set')}")
                print()
        
        print("🎉 Penalties system test completed!")
        
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend server")
        print("Make sure backend is running on http://localhost:5000")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_penalties_system()
#!/usr/bin/env python3
"""
Debug the transaction API mismatch between dashboard and transactions page
"""

import requests
import json

def debug_transaction_apis():
    try:
        # Login first
        login_url = 'http://localhost:5000/api/auth/login'
        login_data = {
            'email': 'test@test.com',  # Althia's email 
            'password': 'althia123'
        }
        
        print("=== DEBUGGING TRANSACTION API MISMATCH ===")
        print("1. Logging in as Althia...")
        
        login_response = requests.post(login_url, json=login_data)
        if login_response.status_code != 200:
            print(f"❌ Login failed: {login_response.text}")
            return
        
        token = login_response.json()['access_token']
        headers = {'Authorization': f'Bearer {token}'}
        print("✅ Login successful")
        
        # Test dashboard API
        print("\n2. Testing Dashboard API...")
        dashboard_response = requests.get('http://localhost:5000/api/users/dashboard', headers=headers)
        
        if dashboard_response.status_code != 200:
            print(f"❌ Dashboard API failed: {dashboard_response.text}")
            return
        
        dashboard_data = dashboard_response.json()
        recent_transactions = dashboard_data.get('recent_transactions', [])
        
        print(f"✅ Dashboard API successful")
        print(f"Recent transactions returned: {len(recent_transactions)}")
        
        if recent_transactions:
            print("\nDashboard recent transactions:")
            for i, txn in enumerate(recent_transactions, 1):
                print(f"  {i}. ID: {txn.get('id')}")
                print(f"     Type: {txn.get('transaction_type')}")
                print(f"     Amount: {txn.get('amount')}")
                print(f"     Date: {txn.get('created_at')}")
                print(f"     Description: {txn.get('description', 'N/A')}")
                print()
        
        # Test transactions page API
        print("3. Testing Transactions Page API...")
        transactions_response = requests.get('http://localhost:5000/api/transactions/', headers=headers)
        
        if transactions_response.status_code != 200:
            print(f"❌ Transactions API failed: {transactions_response.text}")
            return
        
        transactions_data = transactions_response.json()
        all_transactions = transactions_data.get('transactions', [])
        
        print(f"✅ Transactions API successful")
        print(f"Total transactions returned: {len(all_transactions)}")
        
        if all_transactions:
            print("\nTransactions page all transactions:")
            for i, txn in enumerate(all_transactions, 1):
                print(f"  {i}. ID: {txn.get('id')}")
                print(f"     Type: {txn.get('type')}")
                print(f"     Amount: {txn.get('amount')}")
                print(f"     Date: {txn.get('date')}")
                print(f"     Description: {txn.get('description', 'N/A')}")
                print()
        else:
            print("No transactions returned from transactions API")
        
        # Compare the data
        print("4. Data Comparison:")
        print(f"   Dashboard shows: {len(recent_transactions)} recent transactions")
        print(f"   Transactions page shows: {len(all_transactions)} total transactions")
        
        if len(recent_transactions) > 0 and len(all_transactions) == 0:
            print("   ❌ MISMATCH: Dashboard has data but transactions page doesn't")
            print("   This suggests the transactions API is not returning the same data")
        elif len(recent_transactions) <= len(all_transactions):
            print("   ✅ Data counts are consistent")
        
        return True
        
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend server")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    debug_transaction_apis()
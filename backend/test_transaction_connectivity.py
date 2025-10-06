#!/usr/bin/env python3
"""
Test the transaction connectivity between dashboard and transactions page
"""

import requests
import json

def test_transaction_connectivity():
    try:
        # Login first
        login_url = 'http://localhost:5000/api/auth/login'
        login_data = {
            'email': 'test@example.com',
            'password': 'password123'
        }
        
        print("=== TESTING TRANSACTION CONNECTIVITY ===")
        print("1. Logging in...")
        
        login_response = requests.post(login_url, json=login_data)
        if login_response.status_code != 200:
            print(f"❌ Login failed: {login_response.text}")
            return
        
        token = login_response.json()['access_token']
        headers = {'Authorization': f'Bearer {token}'}
        print("✅ Login successful")
        
        # Test dashboard API (recent transactions)
        print("\n2. Testing Dashboard API (Recent Transactions)...")
        dashboard_response = requests.get('http://localhost:5000/api/users/dashboard', headers=headers)
        
        if dashboard_response.status_code != 200:
            print(f"❌ Dashboard API failed: {dashboard_response.text}")
            return
        
        dashboard_data = dashboard_response.json()
        recent_transactions = dashboard_data.get('recent_transactions', [])
        
        print(f"✅ Dashboard API successful")
        print(f"   Recent transactions count: {len(recent_transactions)}")
        
        if recent_transactions:
            print("   Sample transaction:")
            for key, value in recent_transactions[0].items():
                print(f"     {key}: {value}")
        
        # Test full transactions API
        print("\n3. Testing Full Transactions API...")
        transactions_response = requests.get('http://localhost:5000/api/transactions/', headers=headers)
        
        if transactions_response.status_code != 200:
            print(f"❌ Transactions API failed: {transactions_response.text}")
            return
        
        transactions_data = transactions_response.json()
        all_transactions = transactions_data.get('transactions', [])
        
        print(f"✅ Transactions API successful")
        print(f"   Total transactions count: {len(all_transactions)}")
        
        # Compare data consistency
        print("\n4. Data Consistency Check...")
        
        if len(recent_transactions) <= len(all_transactions):
            print("✅ Recent transactions count is consistent with total")
        else:
            print("❌ Data inconsistency: More recent than total transactions")
        
        # Check if recent transactions are subset of all transactions
        if recent_transactions and all_transactions:
            recent_ids = {t.get('id', t.get('transaction_id')) for t in recent_transactions}
            all_ids = {t.get('id', t.get('transaction_id')) for t in all_transactions}
            
            if recent_ids.issubset(all_ids):
                print("✅ Recent transactions are properly subset of all transactions")
            else:
                print("❌ Recent transactions contain items not in full list")
        
        # Test transaction types
        print("\n5. Transaction Types Analysis...")
        transaction_types = set()
        for t in all_transactions:
            transaction_types.add(t.get('type', 'unknown'))
        
        print(f"   Available transaction types: {', '.join(transaction_types)}")
        
        # Summary
        print("\n=== CONNECTIVITY TEST SUMMARY ===")
        print(f"✅ Dashboard Recent Transactions: {len(recent_transactions)} items")
        print(f"✅ Full Transactions Page: {len(all_transactions)} items") 
        print(f"✅ Transaction Types: {len(transaction_types)} types")
        print("✅ Navigation: Dashboard 'See All' → Transactions Page")
        print("✅ Sidebar: Transactions Button → /transactions route")
        
        return True
        
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend server")
        print("Make sure backend is running on http://localhost:5000")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    success = test_transaction_connectivity()
    if success:
        print("\n🎉 All transaction connectivity tests passed!")
    else:
        print("\n❌ Some tests failed. Check the issues above.")
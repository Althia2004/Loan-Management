#!/usr/bin/env python3
"""
Test the comprehensive transactions API
"""

import requests
import json

def test_transactions_api():
    try:
        # First, login to get a token
        login_url = 'http://localhost:5000/api/auth/login'
        login_data = {
            'email': 'test@example.com',
            'password': 'password123'
        }
        
        print("=== TESTING COMPREHENSIVE TRANSACTIONS API ===")
        print("1. Logging in...")
        
        login_response = requests.post(login_url, json=login_data)
        if login_response.status_code != 200:
            print(f"❌ Login failed: {login_response.text}")
            return
        
        token = login_response.json()['access_token']
        print("✅ Login successful")
        
        # Test transactions API
        transactions_url = 'http://localhost:5000/api/transactions'
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
        
        print("2. Fetching comprehensive transactions...")
        
        transactions_response = requests.get(transactions_url, headers=headers)
        
        if transactions_response.status_code != 200:
            print(f"❌ Transactions API failed: {transactions_response.text}")
            return
        
        data = transactions_response.json()
        print("✅ Transactions API successful")
        
        # Display transaction summary
        summary = data.get('summary', {})
        print("\n=== TRANSACTION SUMMARY ===")
        print(f"Total Transactions: {summary.get('total_transactions', 0)}")
        print(f"Loan Payments: {summary.get('total_payments', 0)}")
        print(f"Savings Deposits: {summary.get('total_savings', 0)}")
        print(f"Loan Disbursements: {summary.get('total_loans', 0)}")
        print(f"Penalties: {summary.get('total_penalties', 0)}")
        
        # Display transactions by type
        transactions = data.get('transactions', [])
        print(f"\n=== ALL TRANSACTIONS ({len(transactions)}) ===")
        
        if transactions:
            # Group by type
            transaction_types = {}
            for transaction in transactions:
                tx_type = transaction['type']
                if tx_type not in transaction_types:
                    transaction_types[tx_type] = []
                transaction_types[tx_type].append(transaction)
            
            for tx_type, tx_list in transaction_types.items():
                print(f"\n{tx_type.upper().replace('_', ' ')} ({len(tx_list)} transactions):")
                for tx in tx_list[:3]:  # Show first 3 of each type
                    print(f"  {tx['date'][:10]} - {tx['transaction_id']}")
                    print(f"    Amount: ₱{tx['amount']:,.2f}")
                    print(f"    Description: {tx['description']}")
                    print(f"    Status: {tx['status']}")
                    print()
                
                if len(tx_list) > 3:
                    print(f"    ... and {len(tx_list) - 3} more")
                    print()
        else:
            print("No transactions found")
        
        print("🎉 Comprehensive transactions test completed!")
        
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend server")
        print("Make sure backend is running on http://localhost:5000")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_transactions_api()
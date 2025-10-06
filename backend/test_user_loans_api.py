#!/usr/bin/env python3
"""
Test script to check user loans API endpoint
"""
import requests

def test_user_loans():
    # Login first
    login_response = requests.post('http://localhost:5000/api/auth/login', json={
        'email': 'test@test.com',
        'password': 'althia123'
    })
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.text}")
        return
    
    token = login_response.json()['access_token']
    print(f"✅ Login successful, token: {token[:50]}...")
    
    # Test loans endpoint
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    loans_response = requests.get('http://localhost:5000/api/loans', headers=headers)
    print(f"\n📋 Loans API Response:")
    print(f"Status: {loans_response.status_code}")
    print(f"Response: {loans_response.json()}")

if __name__ == '__main__':
    test_user_loans()
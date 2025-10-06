#!/usr/bin/env python3
import requests
import json

def test_user_login():
    url = 'http://localhost:5000/api/auth/login'
    data = {
        'email': 'test@test.com',
        'password': 'althia123'
    }
    
    print("Testing user login...")
    print(f"URL: {url}")
    print(f"Data: {data}")
    
    try:
        response = requests.post(url, json=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ User login successful!")
            print(f"Access token: {result.get('access_token', 'Not found')}")
        else:
            print("❌ User login failed!")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == '__main__':
    test_user_login()
#!/usr/bin/env python3
import requests
import json

def test_admin_login():
    url = 'http://localhost:5000/api/admin/login'
    data = {
        'username': 'admin',
        'password': 'adminfinal'
    }
    
    print("Testing admin login...")
    print(f"URL: {url}")
    print(f"Data: {data}")
    
    try:
        response = requests.post(url, json=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Admin login successful!")
            print(f"Access token: {result.get('access_token', 'Not found')}")
        else:
            print("❌ Admin login failed!")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == '__main__':
    test_admin_login()
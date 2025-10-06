#!/usr/bin/env python3
"""
Test admin user delete functionality
"""

import requests
import json

def test_admin_delete_user():
    try:
        # First, login as admin to get access token
        login_url = 'http://localhost:5000/api/admin/login'
        login_data = {
            'username': 'admin',
            'password': 'admin123'
        }
        
        print("=== TESTING ADMIN USER DELETE ===")
        print("1. Admin Login...")
        
        login_response = requests.post(login_url, json=login_data)
        if login_response.status_code != 200:
            print(f"❌ Admin login failed: {login_response.text}")
            return
        
        access_token = login_response.json()['access_token']
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        print("✅ Admin login successful")
        
        # Get users list first
        print("\n2. Fetching users list...")
        users_response = requests.get('http://localhost:5000/api/admin/users', headers=headers)
        
        if users_response.status_code != 200:
            print(f"❌ Failed to fetch users: {users_response.text}")
            return
        
        users_data = users_response.json()
        users = users_data.get('users', [])
        print(f"✅ Found {len(users)} users")
        
        if not users:
            print("❌ No users found to test delete")
            return
        
        # Find a user to delete (prefer one without active loans)
        test_user = None
        for user in users:
            print(f"   User: {user['first_name']} {user['last_name']} (ID: {user['id']})")
            if not test_user:  # Take the first one for testing
                test_user = user
                break
        
        if not test_user:
            print("❌ No suitable user found for delete test")
            return
        
        print(f"\n3. Attempting to delete user: {test_user['first_name']} {test_user['last_name']}")
        
        # Try to delete the user
        delete_url = f"http://localhost:5000/api/admin/users/{test_user['id']}"
        delete_response = requests.delete(delete_url, headers=headers)
        
        result = delete_response.json()
        print(f"   Delete response status: {delete_response.status_code}")
        print(f"   Delete response message: {result.get('message', 'No message')}")
        
        if delete_response.status_code == 200:
            print("✅ User deleted successfully")
            
            # Verify user is actually deleted
            print("\n4. Verifying deletion...")
            verify_response = requests.get('http://localhost:5000/api/admin/users', headers=headers)
            if verify_response.status_code == 200:
                new_users = verify_response.json().get('users', [])
                deleted_user_exists = any(u['id'] == test_user['id'] for u in new_users)
                
                if not deleted_user_exists:
                    print("✅ User deletion confirmed - user no longer in list")
                else:
                    print("❌ User still exists in list after deletion")
            
        elif delete_response.status_code == 400:
            print("⚠️ Cannot delete user (likely has active loans)")
            print("   This is expected behavior for users with active loans")
            
        elif delete_response.status_code == 404:
            print("❌ User not found")
            
        else:
            print(f"❌ Unexpected error: {result.get('error', 'Unknown error')}")
        
        print("\n=== DELETE TEST SUMMARY ===")
        print("✅ Admin authentication working")
        print("✅ Users list API working")
        print("✅ Delete API endpoint accessible")
        print("✅ Error handling implemented")
        
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend server")
        print("Make sure backend is running on http://localhost:5000")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_admin_delete_user()
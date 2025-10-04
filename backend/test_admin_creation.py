import requests
import json

# First, login to get access token
login_url = 'http://localhost:5000/api/admin/login'
login_data = {
    'username': 'admin',
    'password': 'admin123'
}

try:
    print('=== TESTING ADMIN CREATION ===')
    
    # Login
    login_response = requests.post(login_url, json=login_data)
    if login_response.status_code != 200:
        print(f'❌ Login failed: {login_response.text}')
        exit()
    
    access_token = login_response.json()['access_token']
    print('✅ Login successful')
    
    # Test admin creation
    create_url = 'http://localhost:5000/api/admin/settings/create-admin'
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    new_admin_data = {
        'name': 'Jane Smith',
        'username': 'janesmith',
        'email': 'jane@admin.com',
        'password': 'jane123'
    }
    
    print(f'Creating admin: {new_admin_data["username"]}')
    
    create_response = requests.post(create_url, json=new_admin_data, headers=headers)
    
    print(f'Status Code: {create_response.status_code}')
    print(f'Response: {create_response.text}')
    
    if create_response.status_code == 201:
        print('✅ Admin creation API working!')
    else:
        print('❌ Admin creation failed')
        
except Exception as e:
    print(f'❌ Error: {e}')
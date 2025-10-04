import requests
import json

try:
    # Test admin login API
    login_url = 'http://localhost:5000/api/admin/login'
    login_data = {
        'username': 'admin',
        'password': 'admin123'
    }
    
    print('=== TESTING ADMIN LOGIN API ===')
    print(f'URL: {login_url}')
    print(f'Data: {login_data}')
    
    response = requests.post(login_url, json=login_data)
    
    print(f'Status Code: {response.status_code}')
    print(f'Response: {response.text}')
    
    if response.status_code == 200:
        result = response.json()
        print('✅ Admin login API working!')
        if 'access_token' in result:
            print('✅ Access token received')
        else:
            print('❌ No access token in response')
    else:
        print('❌ Admin login API failed')
        
except requests.exceptions.ConnectionError:
    print('❌ Cannot connect to backend server')
    print('Make sure backend is running on http://localhost:5000')
except Exception as e:
    print(f'❌ Error: {e}')
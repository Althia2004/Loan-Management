import requests

# First login as admin
login_response = requests.post('http://localhost:5000/api/admin/login', json={
    'username': 'admin',
    'password': 'admin123'
})

if login_response.status_code == 200:
    token = login_response.json()['access_token']
    print(f"✅ Login successful! Token: {token[:50]}...")
    
    # Test charts endpoint
    headers = {'Authorization': f'Bearer {token}'}
    charts_response = requests.get('http://localhost:5000/api/admin/reports/charts', headers=headers)
    
    print(f"\n📊 Charts Response Status: {charts_response.status_code}")
    print(f"\n📊 Charts Data:")
    print(charts_response.json())
else:
    print(f"❌ Login failed: {login_response.status_code}")
    print(login_response.json())

import requests
import json

# First login as admin
login_response = requests.post('http://localhost:5000/api/admin/login', json={
    'username': 'admin',
    'password': 'admin123'
})

print("Login Response:", login_response.status_code)
login_data = login_response.json()
print("Login Data:", json.dumps(login_data, indent=2))

if login_response.status_code == 200:
    token = login_data.get('access_token')
    headers = {'Authorization': f'Bearer {token}'}
    
    # Test stats endpoint
    print("\n=== Testing Stats Endpoint ===")
    stats_response = requests.get('http://localhost:5000/api/admin/reports/stats', headers=headers)
    print("Stats Status:", stats_response.status_code)
    print("Stats Data:", json.dumps(stats_response.json(), indent=2))
    
    # Test activities endpoint
    print("\n=== Testing Activities Endpoint ===")
    activities_response = requests.get('http://localhost:5000/api/admin/reports/activities', headers=headers)
    print("Activities Status:", activities_response.status_code)
    activities_data = activities_response.json()
    print("Activities Count:", len(activities_data.get('activities', [])))
    print("First 3 activities:", json.dumps(activities_data.get('activities', [])[:3], indent=2))
    
    # Test charts endpoint
    print("\n=== Testing Charts Endpoint ===")
    charts_response = requests.get('http://localhost:5000/api/admin/reports/charts', headers=headers)
    print("Charts Status:", charts_response.status_code)
    charts_data = charts_response.json()
    print("Charts Data:", json.dumps(charts_data, indent=2))
else:
    print("Login failed!")

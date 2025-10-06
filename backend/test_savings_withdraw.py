import requests
import json

# Configuration
BASE_URL = "http://localhost:5000"
LOGIN_URL = f"{BASE_URL}/api/auth/login"
SAVINGS_URL = f"{BASE_URL}/api/savings/"
DEPOSIT_URL = f"{BASE_URL}/api/savings/deposit"
WITHDRAW_URL = f"{BASE_URL}/api/savings/withdraw"

# Test user credentials
username = "althia.discaya"
password = "password123"

print("=" * 60)
print("Testing Savings Deposit and Withdrawal Feature")
print("=" * 60)

# Step 1: Login
print("\n1. Logging in...")
login_response = requests.post(LOGIN_URL, json={
    "username": username,
    "password": password
})

if login_response.status_code == 200:
    token = login_response.json()['access_token']
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    print("✓ Login successful!")
else:
    print(f"✗ Login failed: {login_response.text}")
    exit(1)

# Step 2: Check initial savings
print("\n2. Checking initial savings balance...")
savings_response = requests.get(SAVINGS_URL, headers=headers)
if savings_response.status_code == 200:
    initial_balance = savings_response.json()['total_savings']
    print(f"✓ Current balance: ₱{initial_balance:,.2f}")
else:
    print(f"✗ Failed to get savings: {savings_response.text}")
    exit(1)

# Step 3: Make a deposit
print("\n3. Making a deposit of ₱5,000...")
deposit_response = requests.post(DEPOSIT_URL, 
    headers=headers,
    json={"amount": 5000}
)

if deposit_response.status_code == 201:
    print("✓ Deposit successful!")
else:
    print(f"✗ Deposit failed: {deposit_response.text}")

# Step 4: Check balance after deposit
print("\n4. Checking balance after deposit...")
savings_response = requests.get(SAVINGS_URL, headers=headers)
if savings_response.status_code == 200:
    balance_after_deposit = savings_response.json()['total_savings']
    print(f"✓ New balance: ₱{balance_after_deposit:,.2f}")
else:
    print(f"✗ Failed to get savings: {savings_response.text}")

# Step 5: Make a withdrawal
print("\n5. Making a withdrawal of ₱2,000...")
withdraw_response = requests.post(WITHDRAW_URL,
    headers=headers,
    json={"amount": 2000}
)

if withdraw_response.status_code == 201:
    print("✓ Withdrawal successful!")
    print(f"   New balance: ₱{withdraw_response.json()['new_balance']:,.2f}")
else:
    print(f"✗ Withdrawal failed: {withdraw_response.text}")

# Step 6: Check final balance
print("\n6. Checking final balance...")
savings_response = requests.get(SAVINGS_URL, headers=headers)
if savings_response.status_code == 200:
    final_balance = savings_response.json()['total_savings']
    transactions = savings_response.json()['savings']
    print(f"✓ Final balance: ₱{final_balance:,.2f}")
    print(f"\nRecent transactions:")
    for i, txn in enumerate(transactions[:5], 1):
        txn_type = "Deposit" if txn['amount'] >= 0 else "Withdrawal"
        print(f"   {i}. {txn_type}: ₱{abs(txn['amount']):,.2f}")
else:
    print(f"✗ Failed to get savings: {savings_response.text}")

# Step 7: Test withdrawal with insufficient funds
print("\n7. Testing withdrawal with insufficient funds...")
large_withdraw = final_balance + 10000
withdraw_response = requests.post(WITHDRAW_URL,
    headers=headers,
    json={"amount": large_withdraw}
)

if withdraw_response.status_code == 400:
    print(f"✓ Correctly rejected: {withdraw_response.json()['message']}")
else:
    print(f"✗ Should have been rejected but got: {withdraw_response.status_code}")

print("\n" + "=" * 60)
print("Test completed!")
print("=" * 60)

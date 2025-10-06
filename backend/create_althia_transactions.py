#!/usr/bin/env python3
"""
Create some test transaction data for Althia to match the screenshot
"""

import sys
import os
sys.path.append(os.getcwd())

from app import create_app
from extensions import db
from models import User, Transaction, TransactionType, Saving
from datetime import datetime
import uuid

def create_althia_transactions():
    app = create_app()
    
    with app.app_context():
        # Find Althia
        althia = User.query.filter(User.first_name.like('%Althia%')).first()
        if not althia:
            print("❌ Althia not found")
            return
        
        print(f"Found Althia: {althia.first_name} {althia.last_name} (ID: {althia.id})")
        
        # Clear existing transactions to avoid duplicates
        existing_transactions = Transaction.query.filter_by(user_id=althia.id).all()
        for txn in existing_transactions:
            db.session.delete(txn)
        
        print(f"Cleared {len(existing_transactions)} existing transactions")
        
        # Create the transactions shown in the screenshot
        # Transaction 1: Oct 2, 2025 - ₱200,000 savings deposit
        txn1 = Transaction(
            transaction_id=str(uuid.uuid4()),
            user_id=althia.id,
            transaction_type=TransactionType.SAVINGS,
            amount=200000.0,
            description="Savings deposit",
            created_at=datetime(2025, 10, 2, 10, 0, 0)
        )
        
        # Transaction 2: Sept 30, 2025 - ₱2,000,000 savings deposit  
        txn2 = Transaction(
            transaction_id=str(uuid.uuid4()),
            user_id=althia.id,
            transaction_type=TransactionType.SAVINGS,
            amount=2000000.0,
            description="Savings deposit", 
            created_at=datetime(2025, 9, 30, 14, 30, 0)
        )
        
        db.session.add(txn1)
        db.session.add(txn2)
        db.session.commit()
        
        print("✅ Created 2 transactions for Althia:")
        print("   - Oct 2, 2025: ₱200,000 savings deposit")
        print("   - Sept 30, 2025: ₱2,000,000 savings deposit")
        
        # Verify they were created
        althia_transactions = Transaction.query.filter_by(user_id=althia.id).order_by(Transaction.created_at.desc()).all()
        print(f"\n✅ Verified: Althia now has {len(althia_transactions)} transactions")
        
        for i, txn in enumerate(althia_transactions, 1):
            print(f"   {i}. {txn.created_at.strftime('%m/%d/%Y')}: {txn.transaction_type.value} - ₱{txn.amount:,.0f}")

if __name__ == "__main__":
    create_althia_transactions()
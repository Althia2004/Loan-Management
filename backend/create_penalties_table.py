#!/usr/bin/env python3
"""
Create penalties table in the database
"""

import sys
import os
sys.path.append(os.getcwd())

from app import create_app
from extensions import db
from models import Penalty

def create_penalties_table():
    app = create_app()
    
    with app.app_context():
        try:
            # Create the penalties table
            db.create_all()
            print("✅ Penalties table created successfully")
            
            # Verify the table was created
            with db.engine.connect() as connection:
                result = connection.execute(db.text("SELECT name FROM sqlite_master WHERE type='table' AND name='penalties';"))
                penalty_table = result.fetchone()
                
                if penalty_table:
                    print("✅ Penalties table exists in database")
                    
                    # Check table structure
                    result = connection.execute(db.text("PRAGMA table_info(penalties);"))
                    columns = result.fetchall()
                    print(f"✅ Table has {len(columns)} columns:")
                    for col in columns:
                        print(f"  - {col[1]} ({col[2]})")
                else:
                    print("❌ Penalties table not found")
                    
        except Exception as e:
            print(f"❌ Error creating penalties table: {e}")
            
if __name__ == "__main__":
    create_penalties_table()
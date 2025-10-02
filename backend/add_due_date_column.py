#!/usr/bin/env python3
"""
Script to add due_date column to loans table
"""

import sys
import os
import sqlite3

# Add the parent directory to the path so we can import from the app
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def add_due_date_column():
    """Add due_date column to loans table"""
    try:
        # Connect to the SQLite database
        db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'instance', 'loan_management.db')
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if column already exists
        cursor.execute("PRAGMA table_info(loans)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'due_date' not in columns:
            # Add the due_date column
            cursor.execute('ALTER TABLE loans ADD COLUMN due_date DATETIME')
            print("Added due_date column to loans table")
        else:
            print("due_date column already exists")
        
        conn.commit()
        conn.close()
        print("Database migration completed successfully!")
        
    except Exception as e:
        print(f"Error during migration: {str(e)}")

if __name__ == '__main__':
    add_due_date_column()
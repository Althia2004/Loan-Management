from app import create_app
from extensions import db
from models import *
from admin_models import *
from sqlalchemy import text

app = create_app()

with app.app_context():
    try:
        with db.engine.connect() as connection:
            result = connection.execute(text('PRAGMA table_info(loans)'))
            columns = [row[1] for row in result.fetchall()]
            
            if 'loan_type' not in columns:
                print('Adding loan_type column...')
                connection.execute(text('ALTER TABLE loans ADD COLUMN loan_type VARCHAR(20) DEFAULT "personal"'))
                connection.commit()
                print('loan_type column added successfully')
            else:
                print('loan_type column already exists')
    except Exception as e:
        print(f'Error: {e}')
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Transaction, TransactionType
from app import db
from datetime import datetime
import uuid
import random

transactions_bp = Blueprint('transactions', __name__)

@transactions_bp.route('/', methods=['GET'])
@jwt_required()
def get_user_transactions():
    try:
        user_id = get_jwt_identity()
        transactions = Transaction.query.filter_by(user_id=user_id).order_by(Transaction.created_at.desc()).all()
        
        return jsonify({
            'transactions': [transaction.to_dict() for transaction in transactions]
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get transactions', 'error': str(e)}), 500

@transactions_bp.route('/create', methods=['POST'])
@jwt_required()
def create_transaction():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['transaction_type', 'amount']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'message': f'{field} is required'}), 400
        
        # Generate transaction ID
        transaction_id = f"TXN-{random.randint(1000000000, 9999999999)}"
        
        # Create transaction
        transaction = Transaction(
            transaction_id=transaction_id,
            user_id=user_id,
            transaction_type=TransactionType(data['transaction_type']),
            amount=float(data['amount']),
            description=data.get('description', '')
        )
        
        db.session.add(transaction)
        db.session.commit()
        
        return jsonify({
            'message': 'Transaction created successfully',
            'transaction': transaction.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to create transaction', 'error': str(e)}), 500

@transactions_bp.route('/summary', methods=['GET'])
@jwt_required()
def get_transaction_summary():
    try:
        user_id = get_jwt_identity()
        
        # Get transaction counts by type
        loan_transactions = Transaction.query.filter_by(user_id=user_id, transaction_type=TransactionType.LOAN).count()
        savings_transactions = Transaction.query.filter_by(user_id=user_id, transaction_type=TransactionType.SAVINGS).count()
        penalty_transactions = Transaction.query.filter_by(user_id=user_id, transaction_type=TransactionType.PENALTY).count()
        payment_transactions = Transaction.query.filter_by(user_id=user_id, transaction_type=TransactionType.PAYMENT).count()
        
        # Get total amounts by type
        from sqlalchemy import func
        loan_total = db.session.query(func.sum(Transaction.amount)).filter_by(user_id=user_id, transaction_type=TransactionType.LOAN).scalar() or 0
        savings_total = db.session.query(func.sum(Transaction.amount)).filter_by(user_id=user_id, transaction_type=TransactionType.SAVINGS).scalar() or 0
        penalty_total = db.session.query(func.sum(Transaction.amount)).filter_by(user_id=user_id, transaction_type=TransactionType.PENALTY).scalar() or 0
        payment_total = db.session.query(func.sum(Transaction.amount)).filter_by(user_id=user_id, transaction_type=TransactionType.PAYMENT).scalar() or 0
        
        summary = {
            'transaction_counts': {
                'loan': loan_transactions,
                'savings': savings_transactions,
                'penalty': penalty_transactions,
                'payment': payment_transactions
            },
            'transaction_totals': {
                'loan': float(loan_total),
                'savings': float(savings_total),
                'penalty': float(penalty_total),
                'payment': float(payment_total)
            }
        }
        
        return jsonify(summary), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get transaction summary', 'error': str(e)}), 500
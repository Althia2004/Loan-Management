from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Saving
from app import db

savings_bp = Blueprint('savings', __name__)

@savings_bp.route('/', methods=['GET'])
@jwt_required()
def get_user_savings():
    try:
        user_id = get_jwt_identity()
        savings = Saving.query.filter_by(user_id=user_id).order_by(Saving.created_at.desc()).all()
        
        # Calculate total savings (sum of all amounts, deposits are positive, withdrawals are negative)
        total_savings = sum(saving.amount for saving in savings)
        # Ensure total doesn't go negative
        total_savings = max(0, total_savings)
        
        return jsonify({
            'savings': [saving.to_dict() for saving in savings],
            'total_savings': total_savings
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get savings', 'error': str(e)}), 500

@savings_bp.route('/deposit', methods=['POST'])
@jwt_required()
def deposit_savings():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data.get('amount'):
            return jsonify({'message': 'Amount is required'}), 400
        
        amount = float(data['amount'])
        
        # Create new savings record
        saving = Saving(
            user_id=user_id,
            amount=amount,
            balance=amount,
            interest_rate=2.0  # 2% default interest rate
        )
        
        db.session.add(saving)
        
        # Create corresponding transaction
        from models import Transaction, TransactionType
        import random
        
        transaction = Transaction(
            transaction_id=f"TXN-{random.randint(1000000000, 9999999999)}",
            user_id=user_id,
            transaction_type=TransactionType.SAVINGS,
            amount=amount,
            description="Savings deposit"
        )
        
        db.session.add(transaction)
        db.session.commit()
        
        return jsonify({
            'message': 'Savings deposited successfully',
            'saving': saving.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to deposit savings', 'error': str(e)}), 500

@savings_bp.route('/withdraw', methods=['POST'])
@jwt_required()
def withdraw_savings():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data.get('amount'):
            return jsonify({'message': 'Amount is required'}), 400
        
        amount = float(data['amount'])
        
        if amount <= 0:
            return jsonify({'message': 'Amount must be greater than zero'}), 400
        
        # Calculate total savings balance
        savings = Saving.query.filter_by(user_id=user_id).all()
        total_balance = sum(saving.balance for saving in savings)
        
        if amount > total_balance:
            return jsonify({'message': f'Insufficient funds. Available balance: ₱{total_balance:,.2f}'}), 400
        
        # Create withdrawal record (negative amount to track withdrawal)
        withdrawal = Saving(
            user_id=user_id,
            amount=-amount,  # Negative to indicate withdrawal
            balance=total_balance - amount,  # New balance after withdrawal
            interest_rate=2.0
        )
        
        db.session.add(withdrawal)
        
        # Create corresponding transaction
        from models import Transaction, TransactionType
        import random
        
        transaction = Transaction(
            transaction_id=f"TXN-{random.randint(1000000000, 9999999999)}",
            user_id=user_id,
            transaction_type=TransactionType.WITHDRAWAL,
            amount=amount,
            description="Savings withdrawal"
        )
        
        db.session.add(transaction)
        db.session.commit()
        
        return jsonify({
            'message': 'Withdrawal successful',
            'withdrawal': withdrawal.to_dict(),
            'new_balance': total_balance - amount
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to process withdrawal', 'error': str(e)}), 500

@savings_bp.route('/summary', methods=['GET'])
@jwt_required()
def get_savings_summary():
    try:
        user_id = get_jwt_identity()
        
        # Calculate total savings
        savings = Saving.query.filter_by(user_id=user_id).all()
        total_balance = sum(saving.balance for saving in savings)
        total_deposits = len(savings)
        
        # Calculate potential interest (simplified)
        annual_interest = total_balance * 0.02  # 2% annual interest
        monthly_interest = annual_interest / 12
        
        summary = {
            'total_balance': total_balance,
            'total_deposits': total_deposits,
            'estimated_annual_interest': annual_interest,
            'estimated_monthly_interest': monthly_interest
        }
        
        return jsonify(summary), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get savings summary', 'error': str(e)}), 500
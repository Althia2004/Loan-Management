from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User
from app import db

users_bp = Blueprint('users', __name__)

@users_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_user_profile():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'message': 'User not found'}), 404
            
        return jsonify({'user': user.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get user profile', 'error': str(e)}), 500

@users_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_user_profile():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'message': 'User not found'}), 404
            
        data = request.get_json()
        
        # Update allowed fields
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'contact_number' in data:
            user.contact_number = data['contact_number']
        if 'capital_share' in data:
            user.capital_share = float(data['capital_share'])
            # Update membership status and loan eligibility
            user.update_membership_status()
            
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to update profile', 'error': str(e)}), 500

@users_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard_data():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        # Get user's active loans
        from models import Loan, Transaction, LoanStatus
        active_loans = Loan.query.filter_by(user_id=user.id, status=LoanStatus.ACTIVE).all()
        recent_transactions = Transaction.query.filter_by(user_id=user.id).order_by(Transaction.created_at.desc()).limit(5).all()
        
        # Calculate totals
        total_loan_amount = sum(loan.remaining_balance for loan in active_loans)
        total_monthly_payment = sum(loan.monthly_payment for loan in active_loans)
        
        dashboard_data = {
            'user': user.to_dict(),
            'capital_share': user.capital_share,
            'loan_eligibility': user.loan_eligibility,
            'active_loans': [loan.to_dict() for loan in active_loans],
            'total_loan_amount': total_loan_amount,
            'total_monthly_payment': total_monthly_payment,
            'recent_transactions': [transaction.to_dict() for transaction in recent_transactions]
        }
        
        return jsonify(dashboard_data), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get dashboard data', 'error': str(e)}), 500
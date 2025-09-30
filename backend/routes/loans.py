from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Loan, LoanStatus
from app import db
import uuid

loans_bp = Blueprint('loans', __name__)

@loans_bp.route('/', methods=['GET'])
@jwt_required()
def get_user_loans():
    try:
        user_id = get_jwt_identity()
        loans = Loan.query.filter_by(user_id=user_id).all()
        
        return jsonify({
            'loans': [loan.to_dict() for loan in loans]
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get loans', 'error': str(e)}), 500

@loans_bp.route('/apply', methods=['POST'])
@jwt_required()
def apply_for_loan():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['principal_amount', 'duration_months', 'purpose']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'message': f'{field} is required'}), 400
        
        # Check user eligibility
        from models import User
        user = User.query.get(user_id)
        if not user.loan_eligibility:
            return jsonify({'message': 'User not eligible for loan. Minimum capital share of 20,000 PHP required.'}), 400
        
        # Calculate monthly payment (simplified calculation)
        principal = float(data['principal_amount'])
        duration = int(data['duration_months'])
        interest_rate = 0.05  # 5% default interest rate
        
        # Simple interest calculation
        monthly_interest_rate = interest_rate / 12
        monthly_payment = (principal * monthly_interest_rate * (1 + monthly_interest_rate)**duration) / ((1 + monthly_interest_rate)**duration - 1)
        
        # Create loan application
        loan = Loan(
            user_id=user_id,
            principal_amount=principal,
            interest_rate=interest_rate * 100,  # Store as percentage
            duration_months=duration,
            monthly_payment=monthly_payment,
            remaining_balance=principal,
            purpose=data['purpose'],
            status=LoanStatus.PENDING
        )
        
        db.session.add(loan)
        db.session.commit()
        
        return jsonify({
            'message': 'Loan application submitted successfully',
            'loan': loan.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to apply for loan', 'error': str(e)}), 500

@loans_bp.route('/<int:loan_id>/approve', methods=['PUT'])
@jwt_required()
def approve_loan(loan_id):
    try:
        loan = Loan.query.get(loan_id)
        
        if not loan:
            return jsonify({'message': 'Loan not found'}), 404
            
        loan.status = LoanStatus.APPROVED
        db.session.commit()
        
        return jsonify({
            'message': 'Loan approved successfully',
            'loan': loan.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to approve loan', 'error': str(e)}), 500

@loans_bp.route('/<int:loan_id>', methods=['GET'])
@jwt_required()
def get_loan_details(loan_id):
    try:
        user_id = get_jwt_identity()
        loan = Loan.query.filter_by(id=loan_id, user_id=user_id).first()
        
        if not loan:
            return jsonify({'message': 'Loan not found'}), 404
            
        return jsonify({'loan': loan.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get loan details', 'error': str(e)}), 500
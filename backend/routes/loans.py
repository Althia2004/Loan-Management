from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Loan, LoanStatus, LoanType
from extensions import db
import uuid

loans_bp = Blueprint('loans', __name__)

@loans_bp.route('/eligibility', methods=['GET'])
@jwt_required()
def check_loan_eligibility():
    """Check if user can apply for a new loan based on their active loan payment progress"""
    try:
        user_id = int(get_jwt_identity())
        
        # Check for active (approved) loans
        active_loans = Loan.query.filter_by(
            user_id=user_id, 
            status=LoanStatus.APPROVED
        ).all()
        
        if not active_loans:
            # No active loans, user can apply
            return jsonify({
                'eligible': True,
                'message': 'No active loans found. You can apply for a loan.'
            }), 200
        
        # Check if user has paid over 50% of any active loan
        for loan in active_loans:
            paid_amount = loan.principal_amount - loan.remaining_balance
            payment_percentage = (paid_amount / loan.principal_amount) * 100
            
            if payment_percentage < 50:
                return jsonify({
                    'eligible': False,
                    'message': f'You must pay at least 50% of your active loan before applying for a new one. Current payment: {payment_percentage:.1f}%',
                    'payment_percentage': round(payment_percentage, 2),
                    'remaining_to_50': round(50 - payment_percentage, 2),
                    'loan_id': loan.loan_id,
                    'principal_amount': loan.principal_amount,
                    'remaining_balance': loan.remaining_balance
                }), 200
        
        # All active loans have > 50% paid
        return jsonify({
            'eligible': True,
            'message': 'You have paid over 50% of your active loan. You can apply for a new loan.'
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to check eligibility', 'error': str(e)}), 500

@loans_bp.route('/', methods=['GET'])
@jwt_required()
def get_user_loans():
    try:
        print(f"[LOANS] JWT authentication successful")
        user_id_str = get_jwt_identity()
        user_id = int(user_id_str)  # Convert string to int
        print(f"[LOANS] Getting loans for user ID: {user_id} (from JWT: {user_id_str})")
        
        loans = Loan.query.filter_by(user_id=user_id).all()
        print(f"[LOANS] Found {len(loans)} loans for user {user_id}")
        
        for loan in loans:
            print(f"[LOANS] Loan {loan.loan_id}: Status {loan.status.value}, Amount {loan.principal_amount}")
        
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
        
        print(f"=== LOAN APPLICATION REQUEST ===")
        print(f"User ID: {user_id}")
        print(f"Request data: {data}")
        
        # Validate required fields
        required_fields = ['principal_amount', 'duration_months', 'purpose']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'message': f'{field} is required'}), 400
        
        # Check user eligibility
        from models import User
        user = User.query.get(user_id)
        print(f"Found user: {user.first_name} {user.last_name}")
        print(f"Capital share: ₱{user.capital_share:,.2f}")
        print(f"Loan eligibility: {user.loan_eligibility}")
        
        if not user.loan_eligibility:
            print("❌ User not eligible for loan")
            return jsonify({'message': 'User not eligible for loan. Minimum capital share of 20,000 PHP required.'}), 400
        
        # Check if user has paid over 50% of active loans
        active_loans = Loan.query.filter_by(
            user_id=user_id, 
            status=LoanStatus.APPROVED
        ).all()
        
        for loan in active_loans:
            paid_amount = loan.principal_amount - loan.remaining_balance
            payment_percentage = (paid_amount / loan.principal_amount) * 100
            
            if payment_percentage < 50:
                print(f"❌ User has not paid 50% of active loan. Current: {payment_percentage:.1f}%")
                return jsonify({
                    'message': f'You must pay at least 50% of your active loan before applying for a new one. Current payment: {payment_percentage:.1f}%'
                }), 400
        
        # Calculate monthly payment (simplified calculation)
        principal = float(data['principal_amount'])
        duration = int(data['duration_months'])
        interest_rate = 0.05  # 5% default interest rate
        
        # Simple interest calculation
        monthly_interest_rate = interest_rate / 12
        monthly_payment = (principal * monthly_interest_rate * (1 + monthly_interest_rate)**duration) / ((1 + monthly_interest_rate)**duration - 1)
        
        # Create loan application
        loan_type = LoanType.PERSONAL  # default
        if data.get('loan_type'):
            try:
                loan_type = LoanType(data['loan_type'])
            except ValueError:
                loan_type = LoanType.PERSONAL
        
        loan = Loan(
            user_id=user_id,
            principal_amount=principal,
            interest_rate=interest_rate * 100,  # Store as percentage
            duration_months=duration,
            monthly_payment=monthly_payment,
            remaining_balance=principal,
            loan_type=loan_type,
            purpose=data['purpose'],
            status=LoanStatus.PENDING
        )
        
        db.session.add(loan)
        db.session.commit()
        
        print(f"✅ Loan application created successfully!")
        print(f"Loan ID: {loan.id}")
        print(f"Principal: ₱{loan.principal_amount:,.2f}")
        print(f"Monthly payment: ₱{loan.monthly_payment:,.2f}")
        
        return jsonify({
            'message': 'Loan application submitted successfully',
            'loan': loan.to_dict()
        }), 201
        
    except Exception as e:
        print(f"❌ Loan application error: {str(e)}")
        import traceback
        print(f"Full traceback: {traceback.format_exc()}")
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
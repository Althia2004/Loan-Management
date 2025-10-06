from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Payment, Loan
from app import db
from datetime import datetime
import uuid

payments_bp = Blueprint('payments', __name__)

@payments_bp.route('/', methods=['GET'])
@jwt_required()
def get_user_payments():
    try:
        user_id = get_jwt_identity()
        payments = Payment.query.filter_by(user_id=user_id).order_by(Payment.payment_date.desc()).all()
        
        return jsonify({
            'payments': [payment.to_dict() for payment in payments]
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get payments', 'error': str(e)}), 500

@payments_bp.route('/make', methods=['POST'])
@jwt_required()
def make_payment():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        if not data.get('loan_id') or not data.get('amount'):
            return jsonify({'message': 'Loan ID and amount are required'}), 400
        
        # Verify loan belongs to user
        loan = Loan.query.filter_by(id=data['loan_id'], user_id=user_id).first()
        if not loan:
            return jsonify({'message': 'Loan not found'}), 404
        
        amount = float(data['amount'])
        payment_method = data.get('payment_method', 'manual')  # manual, gcash, card
        
        # Create payment record
        payment = Payment(
            user_id=user_id,
            loan_id=loan.id,
            amount=amount,
            status='completed',
            payment_method=payment_method
        )
        
        # Update loan balance
        loan.remaining_balance = max(0, loan.remaining_balance - amount)
        
        # Mark loan as completed if balance is zero
        if loan.remaining_balance == 0:
            from models import LoanStatus
            loan.status = LoanStatus.COMPLETED
        else:
            # Update due date for next payment (advance by 30 days)
            loan.update_due_date_after_payment()
        
        db.session.add(payment)
        db.session.commit()
        
        return jsonify({
            'message': 'Payment processed successfully',
            'payment': payment.to_dict(),
            'remaining_balance': loan.remaining_balance
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to process payment', 'error': str(e)}), 500

@payments_bp.route('/history', methods=['GET'])
@jwt_required()
def get_payment_history():
    try:
        user_id = get_jwt_identity()
        
        # Get payments with loan information
        payments_query = db.session.query(Payment, Loan).join(Loan).filter(Payment.user_id == user_id).order_by(Payment.payment_date.desc()).all()
        
        payment_history = []
        for payment, loan in payments_query:
            payment_data = payment.to_dict()
            payment_data['loan_info'] = {
                'loan_id': loan.loan_id,
                'principal_amount': loan.principal_amount,
                'purpose': loan.purpose
            }
            payment_history.append(payment_data)
        
        return jsonify({
            'payment_history': payment_history
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get payment history', 'error': str(e)}), 500
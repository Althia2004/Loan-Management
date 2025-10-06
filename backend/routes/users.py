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
        from models import Loan, Transaction, LoanStatus, Payment, Penalty
        from sqlalchemy import func, extract
        from datetime import datetime, timedelta
        
        # Get both approved and active loans (approved loans that haven't been marked as active yet)
        active_loans = Loan.query.filter(
            Loan.user_id == user.id,
            Loan.status.in_([LoanStatus.APPROVED, LoanStatus.ACTIVE])
        ).all()
        
        # Get recent transactions from all sources (matching the transactions page logic)
        recent_transactions_list = []
        
        # 1. Regular transactions
        transactions = Transaction.query.filter_by(user_id=user.id).order_by(Transaction.created_at.desc()).limit(10).all()
        for transaction in transactions:
            recent_transactions_list.append({
                'id': transaction.id,
                'transaction_id': transaction.transaction_id,
                'transaction_type': transaction.transaction_type.value,
                'amount': transaction.amount,
                'description': transaction.description or f"{transaction.transaction_type.value.title()} Transaction",
                'status': 'completed',
                'created_at': transaction.created_at.isoformat()
            })
        
        # 2. Recent payments (if any)
        payments = Payment.query.filter_by(user_id=user.id).order_by(Payment.payment_date.desc()).limit(5).all()
        for payment in payments:
            recent_transactions_list.append({
                'id': f"payment_{payment.id}",
                'transaction_id': payment.payment_id,
                'transaction_type': 'loan_payment',
                'amount': payment.amount,
                'description': f"Loan Payment",
                'status': payment.status,
                'created_at': payment.payment_date.isoformat()
            })
        
        # Sort by date and get the 5 most recent
        recent_transactions_list.sort(key=lambda x: x['created_at'], reverse=True)
        recent_transactions = recent_transactions_list[:5]
        
        # Get payment history for the last 12 months
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=365)
        
        # Get monthly payment totals
        monthly_payments = db.session.query(
            extract('year', Payment.payment_date).label('year'),
            extract('month', Payment.payment_date).label('month'),
            func.sum(Payment.amount).label('total_amount')
        ).filter(
            Payment.user_id == user.id,
            Payment.payment_date >= start_date,
            Payment.status == 'completed'
        ).group_by(
            extract('year', Payment.payment_date),
            extract('month', Payment.payment_date)
        ).order_by(
            'year', 'month'
        ).all()
        
        # Calculate totals
        total_principal_amount = sum(loan.principal_amount for loan in active_loans)
        total_remaining_balance = sum(loan.remaining_balance for loan in active_loans)
        total_monthly_payment = sum(loan.monthly_payment for loan in active_loans)
        
        # Calculate penalties for overdue loans
        current_date = datetime.utcnow()
        total_penalties = 0
        overdue_loans = []
        
        for loan in active_loans:
            if loan.is_overdue(current_date):
                penalty_amount = loan.calculate_penalty(current_date)
                total_penalties += penalty_amount
                overdue_loans.append({
                    'loan_id': loan.id,
                    'days_overdue': loan.get_days_overdue(current_date),
                    'penalty_amount': penalty_amount,
                    'due_date': loan.due_date.isoformat() if loan.due_date else None,
                    'monthly_payment': loan.monthly_payment
                })
        
        # Format monthly payment data for chart
        payment_chart_data = []
        current_date = datetime.utcnow()
        
        for i in range(11, -1, -1):  # Last 12 months
            target_date = current_date - timedelta(days=i*30)
            month_name = target_date.strftime('%b')
            year = target_date.year
            month = target_date.month
            
            # Find payment for this month
            month_total = 0
            for payment in monthly_payments:
                if payment.year == year and payment.month == month:
                    month_total = float(payment.total_amount)
                    break
            
            payment_chart_data.append({
                'month': month_name,
                'amount': month_total
            })
        
        dashboard_data = {
            'user': user.to_dict(),
            'capital_share': user.capital_share,
            'loan_eligibility': user.loan_eligibility,
            'active_loans': [loan.to_dict() for loan in active_loans],
            'total_principal_amount': total_principal_amount,
            'total_remaining_balance': total_remaining_balance,
            'total_monthly_payment': total_monthly_payment,
            'total_penalties': total_penalties,
            'overdue_loans': overdue_loans,
            'recent_transactions': recent_transactions,
            'payment_history': payment_chart_data
        }
        
        return jsonify(dashboard_data), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get dashboard data', 'error': str(e)}), 500
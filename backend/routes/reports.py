from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Loan, Payment, Saving, Transaction, LoanStatus
from admin_models import Admin, AdminActivity
from extensions import db
from datetime import datetime, timedelta
from sqlalchemy import func, extract

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    try:
        # Get overall statistics
        total_users = User.query.count()
        total_loans = Loan.query.count()
        active_loans = Loan.query.filter(Loan.status.in_([LoanStatus.APPROVED, LoanStatus.ACTIVE])).count()
        
        total_disbursed = db.session.query(func.sum(Loan.principal_amount)).filter(
            Loan.status.in_([LoanStatus.APPROVED, LoanStatus.ACTIVE, LoanStatus.COMPLETED])
        ).scalar() or 0
        
        total_collected = db.session.query(func.sum(Payment.amount)).scalar() or 0
        total_savings = db.session.query(func.sum(Saving.balance)).scalar() or 0
        
        pending_loans = Loan.query.filter_by(status=LoanStatus.PENDING).count()
        
        return jsonify({
            'total_users': total_users,
            'total_loans': total_loans,
            'active_loans': active_loans,
            'total_disbursed': float(total_disbursed),
            'total_collected': float(total_collected),
            'total_savings': float(total_savings),
            'pending_loans': pending_loans
        })
    except Exception as e:
        print(f"Error fetching stats: {str(e)}")
        return jsonify({'error': str(e)}), 500

@reports_bp.route('/activities', methods=['GET'])
@jwt_required()
def get_activities():
    try:
        # Get recent customer activities (loans, payments, savings)
        activities = []
        
        # Get recent loan applications
        recent_loans = Loan.query.order_by(Loan.created_at.desc()).limit(20).all()
        for loan in recent_loans:
            user = User.query.get(loan.user_id)
            if user:
                activities.append({
                    'id': f'loan_{loan.id}',
                    'type': 'loan',
                    'description': f'Applied for {loan.loan_type.value} loan of ₱{loan.principal_amount:,.2f}',
                    'user': f'{user.first_name} {user.last_name}',
                    'timestamp': loan.created_at.isoformat(),
                    'status': loan.status.value
                })
        
        # Get recent payments
        recent_payments = Payment.query.order_by(Payment.payment_date.desc()).limit(20).all()
        for payment in recent_payments:
            user = User.query.get(payment.user_id)
            if user:
                activities.append({
                    'id': f'payment_{payment.id}',
                    'type': 'payment',
                    'description': f'Made a payment of ₱{payment.amount:,.2f}',
                    'user': f'{user.first_name} {user.last_name}',
                    'timestamp': payment.payment_date.isoformat(),
                    'status': payment.status
                })
        
        # Get recent savings transactions
        recent_savings = Saving.query.order_by(Saving.created_at.desc()).limit(20).all()
        for saving in recent_savings:
            user = User.query.get(saving.user_id)
            if user:
                transaction_type = 'deposit' if saving.amount > 0 else 'withdrawal'
                activities.append({
                    'id': f'saving_{saving.id}',
                    'type': 'savings',
                    'description': f'Made a savings {transaction_type} of ₱{abs(saving.amount):,.2f}',
                    'user': f'{user.first_name} {user.last_name}',
                    'timestamp': saving.created_at.isoformat(),
                    'status': 'completed'
                })
        
        # Sort all activities by timestamp (most recent first)
        activities.sort(key=lambda x: x['timestamp'], reverse=True)
        
        # Return top 50 activities
        return jsonify({'activities': activities[:50]})
    except Exception as e:
        print(f"Error fetching activities: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'activities': []})

@reports_bp.route('/charts', methods=['GET'])
@jwt_required()
def get_charts_data():
    try:
        print("=== FETCHING CHARTS DATA ===")
        
        # 1. LOAN STATUS DISTRIBUTION (Doughnut/Pie Chart)
        pending_loans = Loan.query.filter_by(status=LoanStatus.PENDING).count()
        approved_loans = Loan.query.filter(Loan.status.in_([LoanStatus.APPROVED, LoanStatus.ACTIVE])).count()
        completed_loans = Loan.query.filter_by(status=LoanStatus.COMPLETED).count()
        rejected_loans = Loan.query.filter_by(status=LoanStatus.REJECTED).count()
        
        print(f"Loan Status: Pending={pending_loans}, Active={approved_loans}, Completed={completed_loans}, Rejected={rejected_loans}")
        
        # 2. FINANCIAL OVERVIEW (Bar Chart)
        total_savings = db.session.query(func.sum(Saving.balance)).scalar() or 0
        total_loans_disbursed = db.session.query(func.sum(Loan.principal_amount)).filter(
            Loan.status.in_([LoanStatus.APPROVED, LoanStatus.ACTIVE, LoanStatus.COMPLETED])
        ).scalar() or 0
        total_payments = db.session.query(func.sum(Payment.amount)).scalar() or 0
        outstanding_balance = db.session.query(func.sum(Loan.remaining_balance)).filter(
            Loan.status.in_([LoanStatus.APPROVED, LoanStatus.ACTIVE])
        ).scalar() or 0
        
        print(f"Financial: Savings={total_savings}, Disbursed={total_loans_disbursed}, Payments={total_payments}, Outstanding={outstanding_balance}")
        
        # 3. USER ENGAGEMENT (Doughnut Chart)
        total_users = User.query.count()
        users_with_loans = db.session.query(Loan.user_id).distinct().count()
        users_with_savings = db.session.query(Saving.user_id).distinct().count()
        users_with_payments = db.session.query(Payment.user_id).distinct().count()
        
        print(f"Engagement: Total={total_users}, Loans={users_with_loans}, Savings={users_with_savings}, Payments={users_with_payments}")
        
        result = {
            'loan_status': {
                'labels': ['Pending', 'Active', 'Completed', 'Rejected'],
                'data': [pending_loans, approved_loans, completed_loans, rejected_loans]
            },
            'financial_overview': {
                'labels': ['Total Savings', 'Loans Disbursed', 'Payments Received', 'Outstanding'],
                'data': [float(total_savings), float(total_loans_disbursed), float(total_payments), float(outstanding_balance)]
            },
            'user_engagement': {
                'labels': ['Total Users', 'Users with Loans', 'Users with Savings', 'Active Payers'],
                'data': [total_users, users_with_loans, users_with_savings, users_with_payments]
            }
        }
        
        print(f"Returning result: {result}")
        return jsonify(result)
        
    except Exception as e:
        print(f"!!! ERROR in get_charts_data: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'error': str(e),
            'message': 'Failed to get chart data'
        }), 500




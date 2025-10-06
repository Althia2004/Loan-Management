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
        
        # Get all transaction types for the user
        from models import Payment, Saving, Loan, Penalty, User, LoanStatus
        
        all_transactions = []
        
        # 1. Regular transactions
        transactions = Transaction.query.filter_by(user_id=user_id).all()
        for transaction in transactions:
            all_transactions.append({
                'id': f"txn_{transaction.id}",
                'date': transaction.created_at.isoformat(),
                'transaction_id': transaction.transaction_id,
                'type': transaction.transaction_type.value,
                'amount': transaction.amount,
                'description': transaction.description or f"{transaction.transaction_type.value.title()} Transaction",
                'status': 'completed'
            })
        
        # 2. Loan payments
        payments = Payment.query.filter_by(user_id=user_id).all()
        for payment in payments:
            # Get associated loan info
            loan = Loan.query.get(payment.loan_id)
            loan_info = f"Loan #{loan.id}" if loan else "Unknown Loan"
            
            # Format payment method for display
            payment_method_display = {
                'gcash': 'GCash',
                'card': 'Card',
                'manual': 'Manual'
            }.get(payment.payment_method, 'Manual')
            
            all_transactions.append({
                'id': f"payment_{payment.id}",
                'date': payment.payment_date.isoformat(),
                'transaction_id': payment.payment_id,
                'type': 'loan_payment',
                'amount': payment.amount,
                'description': f"Loan Payment - {loan_info} (via {payment_method_display})",
                'status': payment.status,
                'loan_id': payment.loan_id,
                'payment_method': payment.payment_method
            })
        
        # 3. Savings deposits/withdrawals
        savings = Saving.query.filter_by(user_id=user_id).all()
        for saving in savings:
            # Determine if this is a deposit or withdrawal
            transaction_type = 'savings_deposit' if saving.amount > 0 else 'savings_withdrawal'
            description = f"Savings {'Deposit' if saving.amount > 0 else 'Withdrawal'} - Balance: ₱{saving.balance:,.2f}"
            
            all_transactions.append({
                'id': f"saving_{saving.id}",
                'date': saving.created_at.isoformat(),
                'transaction_id': f"SAV-{saving.id}",
                'type': transaction_type,
                'amount': abs(saving.amount),  # Use absolute value for display
                'description': description,
                'status': 'completed',
                'balance': saving.balance
            })
        
        # 4. Loan disbursements
        loans = Loan.query.filter_by(user_id=user_id).all()
        for loan in loans:
            if loan.approved_at:  # Only include approved loans
                all_transactions.append({
                    'id': f"loan_{loan.id}",
                    'date': loan.approved_at.isoformat(),
                    'transaction_id': loan.loan_id,
                    'type': 'loan_disbursement',
                    'amount': loan.principal_amount,
                    'description': f"Loan Disbursement - {loan.loan_type.value.title()} Loan",
                    'status': 'completed',
                    'loan_status': loan.status.value,
                    'remaining_balance': loan.remaining_balance
                })
        
        # 5. Penalties
        penalties = Penalty.query.filter_by(user_id=user_id).all()
        for penalty in penalties:
            loan = Loan.query.get(penalty.loan_id)
            loan_info = f"Loan #{loan.id}" if loan else "Unknown Loan"
            
            all_transactions.append({
                'id': f"penalty_{penalty.id}",
                'date': penalty.penalty_date.isoformat(),
                'transaction_id': penalty.penalty_id,
                'type': 'penalty',
                'amount': penalty.amount,
                'description': f"Overdue Penalty - {loan_info} ({penalty.days_overdue} days late)",
                'status': penalty.status,
                'days_overdue': penalty.days_overdue,
                'loan_id': penalty.loan_id
            })
        
        # 6. Account creation (registration)
        user = User.query.get(user_id)
        if user and user.created_at:
            all_transactions.append({
                'id': f"account_{user.id}",
                'date': user.created_at.isoformat(),
                'transaction_id': f"ACC-{user.id}",
                'type': 'account_creation',
                'amount': user.capital_share or 0,
                'description': f"Account Registration - Capital Share: ₱{user.capital_share:,.2f}" if user.capital_share else "Account Registration",
                'status': 'completed'
            })
        
        # Sort all transactions by date (newest first)
        all_transactions.sort(key=lambda x: x['date'], reverse=True)
        
        # Add transaction summary
        summary = {
            'total_transactions': len(all_transactions),
            'total_payments': len([t for t in all_transactions if t['type'] == 'loan_payment']),
            'total_savings': len([t for t in all_transactions if t['type'] == 'savings_deposit']),
            'total_withdrawals': len([t for t in all_transactions if t['type'] == 'savings_withdrawal']),
            'total_penalties': len([t for t in all_transactions if t['type'] == 'penalty']),
            'total_loans': len([t for t in all_transactions if t['type'] == 'loan_disbursement'])
        }
        
        return jsonify({
            'transactions': all_transactions,
            'summary': summary
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
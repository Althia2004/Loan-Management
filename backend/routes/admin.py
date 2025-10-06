from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db
from admin_models import Admin, AdminActivity
from models import User, Loan, Transaction, Saving, Payment, LoanStatus
from sqlalchemy import func, desc
from datetime import datetime, timedelta

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/login', methods=['POST'])
def admin_login():
    try:
        data = request.get_json()
        print(f"[ADMIN LOGIN] Received data: {data}")
        
        if not data.get('username') or not data.get('password'):
            print("[ADMIN LOGIN] Missing username or password")
            return jsonify({'message': 'Username and password are required'}), 400
        
        # Allow login with either username or email
        username_or_email = data['username']
        admin = Admin.query.filter(
            (Admin.username == username_or_email) | 
            (Admin.email == username_or_email)
        ).first()
        
        print(f"[ADMIN LOGIN] Found admin: {admin.username if admin else 'None'}")
        print(f"[ADMIN LOGIN] Admin active: {admin.is_active if admin else 'N/A'}")
        
        if admin and admin.check_password(data['password']) and admin.is_active:
            print(f"[ADMIN LOGIN] Login successful for admin: {admin.username}")
            # Update last login
            admin.last_login = datetime.utcnow()
            
            # Log activity
            activity = AdminActivity(
                admin_id=admin.id,
                action='LOGIN',
                description=f'Admin {admin.username} logged in',
                ip_address=request.remote_addr
            )
            db.session.add(activity)
            db.session.commit()
            
            access_token = create_access_token(identity=str(admin.id))
            return jsonify({
                'message': 'Login successful',
                'access_token': access_token,
                'admin': admin.to_dict()
            }), 200
        else:
            print(f"[ADMIN LOGIN] Login failed for username: {username_or_email}")
            return jsonify({'message': 'Invalid credentials'}), 401
            
    except Exception as e:
        return jsonify({'message': 'Login failed', 'error': str(e)}), 500

@admin_bp.route('/dashboard/stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    try:
        # Get current month and year
        now = datetime.utcnow()
        current_month_start = datetime(now.year, now.month, 1)
        
        # Active users
        active_users = User.query.count()
        
        # Total borrowers (users with loans)
        borrowers = User.query.join(Loan).distinct().count()
        
        # Cash disbursed (only approved/active loans that were actually disbursed)
        cash_disbursed = db.session.query(func.sum(Loan.principal_amount)).filter(
            Loan.status.in_([LoanStatus.APPROVED, LoanStatus.ACTIVE, LoanStatus.COMPLETED])
        ).scalar() or 0
        
        # Cash received (total payments)
        cash_received = db.session.query(func.sum(Payment.amount)).scalar() or 0
        
        # Total savings
        total_savings = db.session.query(func.sum(Saving.balance)).scalar() or 0
        
        # Repaid loans count
        repaid_loans = Loan.query.filter_by(status='COMPLETED').count()
        
        # Other accounts (users without loans)
        other_accounts = User.query.filter(~User.id.in_(
            db.session.query(Loan.user_id).distinct()
        )).count()
        
        # Active loans count (only approved and active loans)
        total_loans = Loan.query.filter(
            Loan.status.in_([LoanStatus.APPROVED, LoanStatus.ACTIVE])
        ).count()
        
        return jsonify({
            'active_users': active_users,
            'borrowers': borrowers,
            'cash_disbursed': cash_disbursed,
            'cash_received': cash_received,
            'total_savings': total_savings,
            'repaid_loans': repaid_loans,
            'other_accounts': other_accounts,
            'total_loans': total_loans
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get stats', 'error': str(e)}), 500

@admin_bp.route('/dashboard/recent-loans', methods=['GET'])
@jwt_required()
def get_recent_loans():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        loans = Loan.query.join(User).order_by(desc(Loan.created_at)).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        recent_loans = []
        for loan in loans.items:
            loan_data = loan.to_dict()
            user = User.query.get(loan.user_id)
            loan_data['user_name'] = f"{user.first_name} {user.last_name}"
            loan_data['user_email'] = user.email
            recent_loans.append(loan_data)
        
        return jsonify({
            'loans': recent_loans,
            'total': loans.total,
            'pages': loans.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get recent loans', 'error': str(e)}), 500

@admin_bp.route('/dashboard/monthly-loans', methods=['GET'])
@jwt_required()
def get_monthly_loans_data():
    try:
        # Get loans data for the last 12 months
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=365)
        
        # Group loans by month
        monthly_data = db.session.query(
            func.extract('month', Loan.created_at).label('month'),
            func.count(Loan.id).label('count')
        ).filter(
            Loan.created_at >= start_date
        ).group_by(
            func.extract('month', Loan.created_at)
        ).all()
        
        # Create data for chart (12 months)
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        
        chart_data = []
        for i in range(1, 13):
            count = next((item.count for item in monthly_data if item.month == i), 0)
            chart_data.append(count)
        
        return jsonify({
            'months': months,
            'data': chart_data
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get monthly data', 'error': str(e)}), 500

@admin_bp.route('/loans', methods=['GET'])
@jwt_required()
def get_all_loans():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status')
        
        query = Loan.query.join(User)
        
        if status:
            query = query.filter(Loan.status == status.upper())
        
        loans = query.order_by(desc(Loan.created_at)).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        loans_data = []
        for loan in loans.items:
            loan_data = loan.to_dict()
            user = User.query.get(loan.user_id)
            loan_data['user'] = user.to_dict()
            loans_data.append(loan_data)
        
        return jsonify({
            'loans': loans_data,
            'total': loans.total,
            'pages': loans.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get loans', 'error': str(e)}), 500

@admin_bp.route('/loans/<int:loan_id>/approve', methods=['POST'])
@jwt_required()
def approve_loan(loan_id):
    try:
        print(f"[ADMIN APPROVE] Approving loan {loan_id}")
        admin_id = get_jwt_identity()
        print(f"[ADMIN APPROVE] Admin ID: {admin_id}")
        
        loan = Loan.query.get_or_404(loan_id)
        print(f"[ADMIN APPROVE] Found loan {loan.loan_id}, current status: {loan.status}")
        
        if loan.status != LoanStatus.PENDING:
            print(f"[ADMIN APPROVE] Loan is not pending: {loan.status}")
            return jsonify({'message': f'Loan is not pending approval (current status: {loan.status.value})'}), 400
        
        loan.status = 'APPROVED'
        loan.approved_at = datetime.utcnow()
        
        # Calculate due date (approval date + duration months)
        year = loan.approved_at.year
        month = loan.approved_at.month + loan.duration_months
        
        # Handle month overflow
        while month > 12:
            month -= 12
            year += 1
        
        loan.due_date = loan.approved_at.replace(year=year, month=month)
        
        # Log admin activity
        activity = AdminActivity(
            admin_id=int(admin_id),
            action='APPROVE_LOAN',
            target_type='loan',
            target_id=str(loan_id),
            description=f'Approved loan {loan.loan_id}',
            ip_address=request.remote_addr
        )
        
        db.session.add(activity)
        db.session.commit()
        
        return jsonify({
            'message': 'Loan approved successfully',
            'loan': loan.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to approve loan', 'error': str(e)}), 500

@admin_bp.route('/loans/<int:loan_id>/reject', methods=['POST'])
@jwt_required()
def reject_loan(loan_id):
    try:
        print(f"[ADMIN REJECT] Rejecting loan {loan_id}")
        admin_id = get_jwt_identity()
        print(f"[ADMIN REJECT] Admin ID: {admin_id}")
        
        loan = Loan.query.get_or_404(loan_id)
        print(f"[ADMIN REJECT] Found loan {loan.loan_id}, current status: {loan.status}")
        
        if loan.status != LoanStatus.PENDING:
            print(f"[ADMIN REJECT] Loan is not pending: {loan.status}")
            return jsonify({'message': f'Loan is not pending approval (current status: {loan.status.value})'}), 400
        
        loan.status = 'REJECTED'
        
        # Log admin activity
        activity = AdminActivity(
            admin_id=int(admin_id),
            action='REJECT_LOAN',
            target_type='loan',
            target_id=str(loan_id),
            description=f'Rejected loan {loan.loan_id}',
            ip_address=request.remote_addr
        )
        
        db.session.add(activity)
        db.session.commit()
        
        return jsonify({
            'message': 'Loan rejected successfully',
            'loan': loan.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to reject loan', 'error': str(e)}), 500

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def get_all_users():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        users = User.query.order_by(desc(User.created_at)).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        users_data = []
        for user in users.items:
            user_data = user.to_dict()
            # Add loan count and total borrowed
            user_loans = Loan.query.filter_by(user_id=user.id).all()
            active_loans = Loan.query.filter_by(user_id=user.id, status='ACTIVE').all()
            user_data['loan_count'] = len(user_loans)
            user_data['active_loans'] = len(active_loans)
            user_data['total_borrowed'] = sum(loan.principal_amount for loan in user_loans)
            users_data.append(user_data)
        
        return jsonify({
            'users': users_data,
            'total': users.total,
            'pages': users.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get users', 'error': str(e)}), 500

@admin_bp.route('/recovery-rates', methods=['GET'])
@jwt_required()
def get_recovery_rates():
    try:
        # Calculate recovery rates
        total_loans = Loan.query.count()
        
        # Open, Fully Paid, Default Loans
        completed_loans = Loan.query.filter_by(status='COMPLETED').count()
        active_loans = Loan.query.filter_by(status='ACTIVE').count()
        default_loans = Loan.query.filter_by(status='REJECTED').count()
        
        # Calculate percentages
        open_fully_paid_rate = ((completed_loans + active_loans) / total_loans * 100) if total_loans > 0 else 0
        open_loans_rate = (active_loans / total_loans * 100) if total_loans > 0 else 0
        
        return jsonify({
            'open_fully_paid_default': round(open_fully_paid_rate, 1),
            'open_loans': round(open_loans_rate, 1),
            'total_loans': total_loans,
            'completed_loans': completed_loans,
            'active_loans': active_loans,
            'default_loans': default_loans
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get recovery rates', 'error': str(e)}), 500

@admin_bp.route('/users', methods=['POST'])
@jwt_required()
def create_user():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['first_name', 'last_name', 'email', 'contact_number', 'password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'message': f'{field} is required'}), 400
        
        # Check if email already exists
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return jsonify({'message': 'Email already exists'}), 400
        
        # Create new user
        from werkzeug.security import generate_password_hash
        
        admin_id = get_jwt_identity()
        
        user = User(
            first_name=data['first_name'],
            last_name=data['last_name'],
            email=data['email'],
            contact_number=data['contact_number'],
            password_hash=generate_password_hash(data['password']),
            capital_share=float(data.get('capital_share', 0)),
            created_by_admin=int(admin_id)
        )
        
        # Set membership status and loan eligibility based on capital share
        user.update_membership_status()
        
        db.session.add(user)
        
        # Log activity
        admin_id = get_jwt_identity()
        activity = AdminActivity(
            admin_id=int(admin_id),
            action='CREATE_USER',
            description=f'Created user: {user.first_name} {user.last_name}',
            ip_address=request.remote_addr
        )
        db.session.add(activity)
        db.session.commit()
        
        return jsonify({
            'message': 'User created successfully',
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to create user', 'error': str(e)}), 500

@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        data = request.get_json()
        
        # Update user fields
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'email' in data:
            # Check if email already exists for another user
            existing_user = User.query.filter(User.email == data['email'], User.id != user_id).first()
            if existing_user:
                return jsonify({'message': 'Email already exists'}), 400
            user.email = data['email']
        if 'contact_number' in data:
            user.contact_number = data['contact_number']
        if 'password' in data and data['password']:
            from werkzeug.security import generate_password_hash
            user.password_hash = generate_password_hash(data['password'])
        if 'capital_share' in data:
            user.capital_share = float(data['capital_share'])
            # Update membership status and loan eligibility based on capital share
            user.update_membership_status()
        # Allow manual override for admin only if not updating capital_share
        elif 'member_status' in data:
            user.member_status = data['member_status']
        if 'loan_eligibility' in data and 'capital_share' not in data:
            user.loan_eligibility = data['loan_eligibility']
        
        user.updated_at = datetime.utcnow()
        
        # Log activity
        admin_id = get_jwt_identity()
        activity = AdminActivity(
            admin_id=int(admin_id),
            action='UPDATE_USER',
            description=f'Updated user: {user.first_name} {user.last_name}',
            ip_address=request.remote_addr
        )
        db.session.add(activity)
        db.session.commit()
        
        return jsonify({
            'message': 'User updated successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to update user', 'error': str(e)}), 500

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    try:
        # Temporarily disable foreign key constraints for this operation
        from sqlalchemy import text
        db.session.execute(text('PRAGMA foreign_keys=OFF'))
        print(f"=== DELETE USER REQUEST RECEIVED ===")
        print(f"User ID: {user_id}")
    except Exception as pragma_error:
        print(f"Error disabling foreign keys: {pragma_error}")
    
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        # Get request data for deletion reason
        data = request.get_json() or {}
        deletion_reason = data.get('reason', 'no_reason_provided')
        confirmed_with_loans = data.get('confirmed_with_active_loans', False)
        
        user_name = f"{user.first_name} {user.last_name}"
        
        # Check if user has any loans (active or completed)
        from models import LoanStatus
        all_user_loans = Loan.query.filter_by(user_id=user_id).all()
        active_loans = [loan for loan in all_user_loans if loan.status == LoanStatus.ACTIVE]
        
        # Handle loans - require confirmation if user has any loans
        loans_action_taken = []
        if all_user_loans:
            if not confirmed_with_loans and active_loans:
                return jsonify({
                    'message': f'User has {len(active_loans)} active loan(s). Please confirm deletion with reason.',
                    'active_loans_count': len(active_loans),
                    'requires_confirmation': True
                }), 400
            
            # Delete all loans since we can't preserve them with NULL user_id
            for loan in all_user_loans:
                db.session.delete(loan)
                loans_action_taken.append(f"Loan #{loan.id} deleted ({loan.status.value})")
        
        # Delete related records in proper order to avoid foreign key constraints
        try:
            # Delete penalties first (they reference loans)
            from models import Penalty
            penalties = Penalty.query.join(Loan).filter(Loan.user_id == user_id).all()
            for penalty in penalties:
                db.session.delete(penalty)
            
            # Delete payments individually to avoid bulk delete FK issues
            user_payments = Payment.query.filter_by(user_id=user_id).all()
            for payment in user_payments:
                db.session.delete(payment)
            
            # Delete transactions
            Transaction.query.filter_by(user_id=user_id).delete()
            
            # Delete savings
            Saving.query.filter_by(user_id=user_id).delete()
            
            # We keep loan records for audit but update their status (already done above)
            
            # Finally delete user
            db.session.delete(user)
            
        except Exception as delete_error:
            print(f"Error during deletion process: {str(delete_error)}")
            import traceback
            print(f"Full traceback: {traceback.format_exc()}")
            raise delete_error
        
        # Log activity with detailed information
        admin_id = get_jwt_identity()
        activity_description = f'Deleted user: {user_name}. Reason: {deletion_reason}'
        if active_loans:
            activity_description += f'. Had {len(active_loans)} active loans. Actions: {"; ".join(loans_action_taken)}'
        
        activity = AdminActivity(
            admin_id=int(admin_id),
            action='DELETE_USER_WITH_REASON',
            description=activity_description,
            ip_address=request.remote_addr
        )
        db.session.add(activity)
        db.session.commit()
        
        # Re-enable foreign key constraints
        db.session.execute(text('PRAGMA foreign_keys=ON'))
        
        response_message = f'User {user_name} deleted successfully'
        if active_loans:
            response_message += f'. {len(active_loans)} active loan(s) were handled.'
        
        return jsonify({
            'message': response_message,
            'deletion_reason': deletion_reason,
            'loans_handled': len(active_loans),
            'actions_taken': loans_action_taken
        }), 200
        
    except Exception as e:
        db.session.rollback()
        # Re-enable foreign key constraints even on error
        try:
            db.session.execute(text('PRAGMA foreign_keys=ON'))
        except:
            pass
        return jsonify({'message': 'Failed to delete user', 'error': str(e)}), 500

@admin_bp.route('/loans/overdue', methods=['GET'])
@jwt_required()
def get_overdue_loans():
    try:
        # Get all active loans that are past their due date
        today = datetime.utcnow()
        
        overdue_loans = Loan.query.filter(
            Loan.status == 'ACTIVE',
            Loan.due_date < today,
            Loan.due_date.isnot(None)
        ).join(User).all()
        
        loans_data = []
        for loan in overdue_loans:
            loan_data = loan.to_dict()
            user = User.query.get(loan.user_id)
            loan_data['user'] = user.to_dict()
            
            # Calculate days overdue
            if loan.due_date:
                days_overdue = (today - loan.due_date).days
                loan_data['days_overdue'] = days_overdue
            else:
                loan_data['days_overdue'] = 0
            
            loans_data.append(loan_data)
        
        # Sort by days overdue (most overdue first)
        loans_data.sort(key=lambda x: x['days_overdue'], reverse=True)
        
        return jsonify({
            'overdue_loans': loans_data,
            'count': len(loans_data)
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get overdue loans', 'error': str(e)}), 500

@admin_bp.route('/activities', methods=['GET'])
@jwt_required()
def get_admin_activities():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        action_filter = request.args.get('action')
        date_filter = request.args.get('date_filter')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        # Build query
        query = AdminActivity.query.join(Admin)
        
        # Filter by action
        if action_filter:
            query = query.filter(AdminActivity.action == action_filter)
        
        # Filter by date
        if date_filter:
            today = datetime.utcnow()
            
            if date_filter == 'today':
                start_of_day = today.replace(hour=0, minute=0, second=0, microsecond=0)
                query = query.filter(AdminActivity.created_at >= start_of_day)
            
            elif date_filter == 'week':
                start_of_week = today - timedelta(days=today.weekday())
                start_of_week = start_of_week.replace(hour=0, minute=0, second=0, microsecond=0)
                query = query.filter(AdminActivity.created_at >= start_of_week)
            
            elif date_filter == 'month':
                start_of_month = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
                query = query.filter(AdminActivity.created_at >= start_of_month)
            
            elif date_filter == 'year':
                start_of_year = today.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
                query = query.filter(AdminActivity.created_at >= start_of_year)
        
        # Custom date range
        if start_date:
            try:
                start_dt = datetime.strptime(start_date, '%Y-%m-%d')
                query = query.filter(AdminActivity.created_at >= start_dt)
            except ValueError:
                pass
        
        if end_date:
            try:
                end_dt = datetime.strptime(end_date, '%Y-%m-%d')
                end_dt = end_dt.replace(hour=23, minute=59, second=59)
                query = query.filter(AdminActivity.created_at <= end_dt)
            except ValueError:
                pass
        
        # Paginate and order by most recent first
        activities = query.order_by(desc(AdminActivity.created_at)).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        activities_data = []
        for activity in activities.items:
            admin = Admin.query.get(activity.admin_id)
            activity_data = activity.to_dict()
            activity_data['admin_name'] = f"{admin.first_name} {admin.last_name}" if admin else "Unknown Admin"
            activities_data.append(activity_data)
        
        return jsonify({
            'activities': activities_data,
            'total': activities.total,
            'pages': activities.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get admin activities', 'error': str(e)}), 500

@admin_bp.route('/savings', methods=['GET'])
@jwt_required()
def get_all_savings():
    """Get all user savings accounts with summary data"""
    try:
        admin_id = get_jwt_identity()
        
        # Log activity
        activity = AdminActivity(
            admin_id=admin_id,
            action='VIEW_SAVINGS',
            description='Admin viewed savings accounts',
            ip_address=request.remote_addr
        )
        db.session.add(activity)
        db.session.commit()
        
        # Get all users with their savings data
        users_query = db.session.query(
            User.id,
            User.user_id,
            func.concat(User.first_name, ' ', User.last_name).label('user_name'),
            User.email,
            func.coalesce(func.sum(Saving.balance), 0).label('total_balance'),
            func.max(Saving.created_at).label('last_deposit_date')
        ).outerjoin(Saving, User.id == Saving.user_id)\
         .group_by(User.id, User.user_id, User.first_name, User.last_name, User.email)
        
        savings_accounts = []
        
        for user in users_query.all():
            # Get last deposit amount
            last_deposit = Saving.query.filter_by(user_id=user.id)\
                                     .order_by(desc(Saving.created_at))\
                                     .first()
            
            last_deposit_amount = last_deposit.amount if last_deposit else 0
            
            savings_accounts.append({
                'user_id': user.id,
                'user_name': user.user_name,
                'email': user.email,
                'total_balance': float(user.total_balance),
                'last_deposit_amount': float(last_deposit_amount),
                'last_deposit_date': user.last_deposit_date.isoformat() if user.last_deposit_date else None
            })
        
        return jsonify({
            'savings_accounts': savings_accounts
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get savings data', 'error': str(e)}), 500

@admin_bp.route('/savings/<int:user_id>/transactions', methods=['GET'])
@jwt_required()
def get_user_savings_transactions(user_id):
    """Get all savings transactions for a specific user"""
    try:
        admin_id = get_jwt_identity()
        
        # Log activity
        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        activity = AdminActivity(
            admin_id=admin_id,
            action='VIEW_USER_SAVINGS',
            description=f'Admin viewed savings transactions for user {user.first_name} {user.last_name}',
            ip_address=request.remote_addr
        )
        db.session.add(activity)
        db.session.commit()
        
        # Get all savings-related transactions for this user
        transactions = Transaction.query.filter(
            Transaction.user_id == user_id,
            Transaction.transaction_type == 'SAVINGS'
        ).order_by(desc(Transaction.created_at)).all()
        
        transaction_data = []
        for transaction in transactions:
            transaction_data.append({
                'transaction_id': transaction.transaction_id,
                'amount': transaction.amount,
                'transaction_type': transaction.transaction_type.value,
                'description': transaction.description,
                'created_at': transaction.created_at.isoformat()
            })
        
        return jsonify({
            'transactions': transaction_data,
            'user_info': {
                'user_id': user.id,
                'name': f"{user.first_name} {user.last_name}",
                'email': user.email
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get user transactions', 'error': str(e)}), 500

# Reports Routes - MOVED TO routes/reports.py
# @admin_bp.route('/reports/stats', methods=['GET'])
# @jwt_required()
# def get_reports_stats():
#     (old code commented out - now using routes/reports.py)

# @admin_bp.route('/reports/activities', methods=['GET'])
# @jwt_required()
# def get_reports_activities():
#     (old code commented out - now using routes/reports.py)

# @admin_bp.route('/reports/charts', methods=['GET'])
# @jwt_required()
# def get_reports_charts():
#     (old code commented out - now using routes/reports.py)

# Settings endpoints
@admin_bp.route('/settings/profile', methods=['PUT'])
@jwt_required()
def update_admin_profile():
    try:
        admin_id = get_jwt_identity()
        admin = Admin.query.get(admin_id)
        
        if not admin:
            return jsonify({'message': 'Admin not found'}), 404
        
        # Handle form data (including file uploads)
        name = request.form.get('name')
        email = request.form.get('email')
        current_password = request.form.get('currentPassword')
        new_password = request.form.get('newPassword')
        image_file = request.files.get('image')
        
        # Validate required fields
        if not name or not email:
            return jsonify({'message': 'Name and email are required'}), 400
        
        # Check if email already exists (excluding current admin)
        existing_admin = Admin.query.filter(Admin.email == email, Admin.id != admin.id).first()
        if existing_admin:
            return jsonify({'message': 'Email already exists'}), 400
        
        # Update basic info
        admin.name = name
        admin.email = email
        
        # Handle password update
        if new_password:
            if not current_password:
                return jsonify({'message': 'Current password is required to set new password'}), 400
            
            if not check_password_hash(admin.password_hash, current_password):
                return jsonify({'message': 'Current password is incorrect'}), 400
            
            admin.password_hash = generate_password_hash(new_password)
        
        # Handle image upload
        if image_file:
            import os
            from werkzeug.utils import secure_filename
            
            # Create uploads directory if it doesn't exist
            upload_folder = os.path.join('static', 'admin_images')
            os.makedirs(upload_folder, exist_ok=True)
            
            # Save the file
            filename = secure_filename(f"admin_{admin.id}_{image_file.filename}")
            file_path = os.path.join(upload_folder, filename)
            image_file.save(file_path)
            
            # Update admin image URL
            admin.image_url = f"/static/admin_images/{filename}"
        
        admin.updated_at = datetime.utcnow()
        
        # Log activity
        activity = AdminActivity(
            admin_id=admin.id,
            action='PROFILE_UPDATE',
            description=f'Admin {admin.username} updated their profile',
            ip_address=request.remote_addr
        )
        db.session.add(activity)
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'admin': admin.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to update profile', 'error': str(e)}), 500

@admin_bp.route('/settings/admins', methods=['GET'])
@jwt_required()
def get_admin_list():
    try:
        admins = Admin.query.filter(Admin.is_active == True).all()
        return jsonify({
            'admins': [admin.to_dict() for admin in admins]
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get admin list', 'error': str(e)}), 500

@admin_bp.route('/settings/create-admin', methods=['POST'])
@jwt_required()
def create_admin():
    try:
        current_admin_id = get_jwt_identity()
        current_admin = Admin.query.get(current_admin_id)
        
        if not current_admin:
            return jsonify({'message': 'Admin not found'}), 404
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'username', 'email', 'password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'message': f'{field.replace("_", " ").title()} is required'}), 400
        
        # Parse full name into first and last name
        full_name_parts = data['name'].strip().split()
        if len(full_name_parts) < 2:
            first_name = full_name_parts[0] if full_name_parts else ''
            last_name = 'Admin'  # Default last name
        else:
            first_name = full_name_parts[0]
            last_name = ' '.join(full_name_parts[1:])
        
        # Check if username already exists
        if Admin.query.filter_by(username=data['username']).first():
            return jsonify({'message': 'Username already exists'}), 400
        
        # Check if email already exists
        if Admin.query.filter_by(email=data['email']).first():
            return jsonify({'message': 'Email already exists'}), 400
        
        # Create new admin
        from extensions import bcrypt
        new_admin = Admin(
            first_name=first_name,
            last_name=last_name,
            name=data['name'],
            username=data['username'],
            email=data['email'],
            password_hash=bcrypt.generate_password_hash(data['password']).decode('utf-8'),
            is_active=True,
            created_by=current_admin.id
        )
        
        db.session.add(new_admin)
        
        # Log activity
        activity = AdminActivity(
            admin_id=current_admin.id,
            action='CREATE_ADMIN',
            description=f'Admin {current_admin.username} created new admin account: {data["username"]}',
            ip_address=request.remote_addr
        )
        db.session.add(activity)
        db.session.commit()
        
        return jsonify({
            'message': 'Admin account created successfully',
            'admin': new_admin.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to create admin account', 'error': str(e)}), 500

@admin_bp.route('/settings/admin/<int:admin_id>', methods=['DELETE'])
@jwt_required()
def delete_admin(admin_id):
    try:
        current_admin_id = get_jwt_identity()
        current_admin = Admin.query.get(current_admin_id)
        
        if not current_admin:
            return jsonify({'message': 'Admin not found'}), 404
        
        # Prevent self-deletion
        if str(admin_id) == str(current_admin_id):
            return jsonify({'message': 'Cannot delete your own account'}), 400
        
        admin_to_delete = Admin.query.get(admin_id)
        if not admin_to_delete:
            return jsonify({'message': 'Admin to delete not found'}), 404
        
        # Soft delete - set is_active to False
        admin_to_delete.is_active = False
        admin_to_delete.updated_at = datetime.utcnow()
        
        # Log activity
        activity = AdminActivity(
            admin_id=current_admin.id,
            action='DELETE_ADMIN',
            description=f'Admin {current_admin.username} deleted admin account: {admin_to_delete.username}',
            ip_address=request.remote_addr
        )
        db.session.add(activity)
        db.session.commit()
        
        return jsonify({'message': 'Admin account deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to delete admin account', 'error': str(e)}), 500
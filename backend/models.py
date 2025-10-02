from extensions import db   # ✅ instead of "from app import db"
from datetime import datetime
from enum import Enum
import uuid

class LoanStatus(Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    ACTIVE = "active"
    COMPLETED = "completed"

class LoanType(Enum):
    PERSONAL = "personal"
    BUSINESS = "business"
    EMERGENCY = "emergency"
    EDUCATION = "education"
    HOME = "home"
    CAR = "car"
    MEDICAL = "medical"

class TransactionType(Enum):
    LOAN = "loan"
    SAVINGS = "savings"
    PENALTY = "penalty"
    PAYMENT = "payment"

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(36), unique=True, default=lambda: str(uuid.uuid4()))
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    contact_number = db.Column(db.String(20), nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    capital_share = db.Column(db.Float, default=0.0)
    member_status = db.Column(db.String(20), default='REGULAR MEMBER')
    loan_eligibility = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    loans = db.relationship('Loan', backref='borrower', lazy=True)
    transactions = db.relationship('Transaction', backref='user', lazy=True)
    savings = db.relationship('Saving', backref='user', lazy=True)
    payments = db.relationship('Payment', backref='user', lazy=True)
    
    def update_membership_status(self):
        """Update membership status and loan eligibility based on capital share"""
        if self.capital_share >= 20000:
            self.member_status = 'REGULAR MEMBER'
            self.loan_eligibility = True
        else:
            self.member_status = 'MEMBER'
            self.loan_eligibility = False
        self.updated_at = datetime.utcnow()
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'email': self.email,
            'contact_number': self.contact_number,
            'capital_share': self.capital_share,
            'member_status': self.member_status,
            'loan_eligibility': self.loan_eligibility,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Loan(db.Model):
    __tablename__ = 'loans'
    
    id = db.Column(db.Integer, primary_key=True)
    loan_id = db.Column(db.String(36), unique=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    principal_amount = db.Column(db.Float, nullable=False)
    interest_rate = db.Column(db.Float, nullable=False)
    duration_months = db.Column(db.Integer, nullable=False)
    monthly_payment = db.Column(db.Float, nullable=False)
    remaining_balance = db.Column(db.Float, nullable=False)
    status = db.Column(db.Enum(LoanStatus), default=LoanStatus.PENDING)
    loan_type = db.Column(db.Enum(LoanType), default=LoanType.PERSONAL)
    purpose = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    approved_at = db.Column(db.DateTime)
    due_date = db.Column(db.DateTime)
    
    def to_dict(self):
        return {
            'id': self.id,
            'loan_id': self.loan_id,
            'user_id': self.user_id,
            'principal_amount': self.principal_amount,
            'interest_rate': self.interest_rate,
            'duration_months': self.duration_months,
            'monthly_payment': self.monthly_payment,
            'remaining_balance': self.remaining_balance,
            'status': self.status.value,
            'loan_type': self.loan_type.value,
            'purpose': self.purpose,
            'created_at': self.created_at.isoformat(),
            'approved_at': self.approved_at.isoformat() if self.approved_at else None,
            'due_date': self.due_date.isoformat() if self.due_date else None
        }

class Transaction(db.Model):
    __tablename__ = 'transactions'
    
    id = db.Column(db.Integer, primary_key=True)
    transaction_id = db.Column(db.String(50), unique=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    transaction_type = db.Column(db.Enum(TransactionType), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'transaction_id': self.transaction_id,
            'user_id': self.user_id,
            'transaction_type': self.transaction_type.value,
            'amount': self.amount,
            'description': self.description,
            'created_at': self.created_at.isoformat()
        }

class Saving(db.Model):
    __tablename__ = 'savings'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    balance = db.Column(db.Float, default=0.0)
    interest_rate = db.Column(db.Float, default=2.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'amount': self.amount,
            'balance': self.balance,
            'interest_rate': self.interest_rate,
            'created_at': self.created_at.isoformat()
        }

class Payment(db.Model):
    __tablename__ = 'payments'
    
    id = db.Column(db.Integer, primary_key=True)
    payment_id = db.Column(db.String(36), unique=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    loan_id = db.Column(db.Integer, db.ForeignKey('loans.id'))
    amount = db.Column(db.Float, nullable=False)
    payment_date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='completed')
    
    def to_dict(self):
        return {
            'id': self.id,
            'payment_id': self.payment_id,
            'user_id': self.user_id,
            'loan_id': self.loan_id,
            'amount': self.amount,
            'payment_date': self.payment_date.isoformat(),
            'status': self.status
        }
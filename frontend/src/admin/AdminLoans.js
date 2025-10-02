import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAdminAuth } from '../contexts/AdminAuthContext';

const LoansContainer = styled.div`
  margin-left: 250px; /* Account for sidebar */
  padding: 20px;
  background: #f8f9fa;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const PageTitle = styled.h1`
  color: #333;
  margin: 0;
  font-size: 28px;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  border-bottom: 2px solid #f0f0f0;
`;

const Tab = styled.button`
  padding: 12px 24px;
  border: none;
  background: none;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
  
  &.active {
    color: #667eea;
    border-bottom-color: #667eea;
  }
  
  &:hover {
    color: #667eea;
  }
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
`;

const FilterSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  font-size: 14px;
  min-width: 120px;
`;

const OverdueIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  color: #dc3545;
  font-weight: 600;
  font-size: 12px;
`;

const DaysOverdue = styled.span`
  background: #dc3545;
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 500;
`;

const StatsCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: ${props => props.color || '#333'};
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 14px;
`;

const LoansTable = styled.div`
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 120px;
  padding: 15px 20px;
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #eee;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 120px;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  align-items: center;
  
  &:hover {
    background: #f8f9fa;
  }
`;

const OverdueRow = styled(TableRow)`
  background-color: #ffebee !important;
  border-left: 4px solid #dc3545;
  
  &:hover {
    background-color: #ffcdd2 !important;
  }
`;

const UserInfo = styled.div`
  h4 {
    margin: 0 0 5px;
    color: #333;
    font-size: 14px;
  }
  
  p {
    margin: 0;
    color: #666;
    font-size: 12px;
  }
`;

const LoanAmount = styled.div`
  font-weight: 600;
  color: #333;
`;

const LoanTypeTag = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  background: ${props => {
    switch (props.type) {
      case 'business': return '#e3f2fd';
      case 'emergency': return '#fff3e0';
      case 'personal': return '#f3e5f5';
      case 'education': return '#e8f5e8';
      case 'home': return '#fff8e1';
      case 'car': return '#e0f2f1';
      case 'medical': return '#ffebee';
      default: return '#f5f5f5';
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'business': return '#1976d2';
      case 'emergency': return '#f57c00';
      case 'personal': return '#7b1fa2';
      case 'education': return '#388e3c';
      case 'home': return '#fbc02d';
      case 'car': return '#00796b';
      case 'medical': return '#d32f2f';
      default: return '#666';
    }
  }};
`;

const StatusBadge = styled.span`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  background: ${props => {
    switch (props.status) {
      case 'pending': return '#fff3cd';
      case 'approved': return '#d4edda';
      case 'rejected': return '#f8d7da';
      case 'active': return '#d1ecf1';
      case 'completed': return '#d4edda';
      default: return '#f8f9fa';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'pending': return '#856404';
      case 'approved': return '#155724';
      case 'rejected': return '#721c24';
      case 'active': return '#0c5460';
      case 'completed': return '#155724';
      default: return '#666';
    }
  }};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 5px;
`;

const ActionButton = styled.button`
  padding: 6px 10px;
  border: none;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &.approve {
    background: #28a745;
    color: white;
    
    &:hover {
      background: #218838;
    }
  }
  
  &.reject {
    background: #dc3545;
    color: white;
    
    &:hover {
      background: #c82333;
    }
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #666;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  padding: 20px;
  background: white;
`;

const PageButton = styled.button`
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background: #f8f9fa;
  }
  
  &.active {
    background: #667eea;
    color: white;
    border-color: #667eea;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const AdminLoans = () => {
  const { getAuthHeaders } = useAdminAuth();
  const [loans, setLoans] = useState([]);
  const [overdueLoans, setOverdueLoans] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'overdue'
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLoans();
  }, [filter, typeFilter, currentPage]);

  const calculateDaysOverdue = (approvedDate, durationMonths) => {
    if (!approvedDate) return 0;
    
    const approved = new Date(approvedDate);
    const dueDate = new Date(approved);
    dueDate.setMonth(dueDate.getMonth() + durationMonths);
    
    const today = new Date();
    const timeDiff = today - dueDate;
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    return daysDiff > 0 ? daysDiff : 0;
  };

  const isLoanOverdue = (loan) => {
    if (loan.status !== 'active') return false;
    return calculateDaysOverdue(loan.approved_at, loan.duration_months) > 0;
  };

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      
      let url = `/api/admin/loans?page=${currentPage}&per_page=50`; // Get more loans to filter overdue
      if (filter !== 'all' && activeTab === 'all') {
        url += `&status=${filter}`;
      }
      
      const response = await fetch(url, { headers });
      const data = await response.json();
      
      let allLoans = data.loans || [];
      
      // Add overdue information to each loan
      allLoans = allLoans.map(loan => ({
        ...loan,
        isOverdue: isLoanOverdue(loan),
        daysOverdue: isLoanOverdue(loan) ? calculateDaysOverdue(loan.approved_at, loan.duration_months) : 0
      }));

      // Filter by loan type
      if (typeFilter !== 'all') {
        allLoans = allLoans.filter(loan => loan.loan_type === typeFilter);
      }

      // Separate overdue loans
      const overdueLoansList = allLoans.filter(loan => loan.isOverdue);
      const regularLoans = allLoans.filter(loan => !loan.isOverdue);
      
      setOverdueLoans(overdueLoansList);
      setLoans(regularLoans);
      setTotalPages(Math.ceil(regularLoans.length / 10));
      
      // Calculate stats including overdue
      const pendingCount = allLoans.filter(l => l.status === 'pending').length;
      const approvedCount = allLoans.filter(l => l.status === 'approved').length;
      const rejectedCount = allLoans.filter(l => l.status === 'rejected').length;
      const activeCount = allLoans.filter(l => l.status === 'active').length;
      const overdueCount = overdueLoansList.length;
      
      setStats({
        total: allLoans.length,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        active: activeCount,
        overdue: overdueCount
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch loans:', error);
      setLoading(false);
    }
  };

  const handleLoanAction = async (loanId, action) => {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`/api/admin/loans/${loanId}/${action}`, {
        method: 'POST',
        headers
      });
      
      if (response.ok) {
        fetchLoans(); // Refresh the list
      }
    } catch (error) {
      console.error(`Failed to ${action} loan:`, error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  if (loading) {
    return (
      <LoansContainer>
        <LoadingSpinner>Loading loans...</LoadingSpinner>
      </LoansContainer>
    );
  }

  return (
    <LoansContainer>
      <Header>
        <PageTitle>Loan Management</PageTitle>
      </Header>

      <TabContainer>
        <Tab 
          className={activeTab === 'all' ? 'active' : ''}
          onClick={() => setActiveTab('all')}
        >
          All Loans ({stats.total || 0})
        </Tab>
        <Tab 
          className={activeTab === 'overdue' ? 'active' : ''}
          onClick={() => setActiveTab('overdue')}
        >
          Overdue Loans ({stats.overdue || 0})
        </Tab>
      </TabContainer>

      {activeTab === 'all' && (
        <FilterContainer>
          <FilterSelect value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </FilterSelect>
          
          <FilterSelect value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">All Types</option>
            <option value="personal">Personal</option>
            <option value="business">Business</option>
            <option value="emergency">Emergency</option>
            <option value="education">Education</option>
            <option value="home">Home</option>
            <option value="car">Car</option>
            <option value="medical">Medical</option>
          </FilterSelect>
        </FilterContainer>
      )}

      <StatsCards>
        <StatCard>
          <StatNumber color="#333">{stats.total || 0}</StatNumber>
          <StatLabel>Total Loans</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatNumber color="#f39c12">{stats.pending || 0}</StatNumber>
          <StatLabel>Pending</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatNumber color="#27ae60">{stats.approved || 0}</StatNumber>
          <StatLabel>Approved</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatNumber color="#3498db">{stats.active || 0}</StatNumber>
          <StatLabel>Active</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatNumber color="#dc3545">{stats.overdue || 0}</StatNumber>
          <StatLabel>Overdue</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatNumber color="#e74c3c">{stats.rejected || 0}</StatNumber>
          <StatLabel>Rejected</StatLabel>
        </StatCard>
      </StatsCards>

      <LoansTable>
        {activeTab === 'overdue' ? (
          <>
            <TableHeader>
              <div>Borrower</div>
              <div>Amount</div>
              <div>Type</div>
              <div>Status</div>
              <div>Due Date</div>
              <div>Days Overdue</div>
              <div>Actions</div>
            </TableHeader>
            
            {overdueLoans.map((loan) => (
              <OverdueRow key={loan.id}>
                <UserInfo>
                  <h4>{loan.user?.first_name} {loan.user?.last_name}</h4>
                  <p>{loan.user?.email}</p>
                </UserInfo>
                
                <LoanAmount style={{color: '#dc3545'}}>{formatCurrency(loan.principal_amount)}</LoanAmount>
                
                <div>
                  <LoanTypeTag type={loan.loan_type}>
                    {loan.loan_type || 'personal'}
                  </LoanTypeTag>
                </div>
                
                <OverdueIndicator>
                  ⚠️ OVERDUE
                </OverdueIndicator>
                
                <div style={{color: '#dc3545', fontWeight: 'bold'}}>
                  {formatDate(new Date(new Date(loan.approved_at).setMonth(new Date(loan.approved_at).getMonth() + loan.duration_months)))}
                </div>
                
                <DaysOverdue>
                  {loan.daysOverdue} days
                </DaysOverdue>
                
                <ActionButtons>
                  <ActionButton className="reject" onClick={() => alert('Contact borrower for payment')}>
                    Contact
                  </ActionButton>
                </ActionButtons>
              </OverdueRow>
            ))}
          </>
        ) : (
          <>
            <TableHeader>
              <div>Borrower</div>
              <div>Amount</div>
              <div>Type</div>
              <div>Status</div>
              <div>Applied Date</div>
              <div>Duration</div>
              <div>Actions</div>
            </TableHeader>
            
            {loans.map((loan) => (
              <TableRow key={loan.id}>
                <UserInfo>
                  <h4>{loan.user?.first_name} {loan.user?.last_name}</h4>
                  <p>{loan.user?.email}</p>
                </UserInfo>
                
                <LoanAmount>{formatCurrency(loan.principal_amount)}</LoanAmount>
                
                <div>
                  <LoanTypeTag type={loan.loan_type}>
                    {loan.loan_type || 'personal'}
                  </LoanTypeTag>
                </div>
                
                <StatusBadge status={loan.status}>
                  {loan.status}
                </StatusBadge>
                
                <div>{formatDate(loan.created_at)}</div>
                
                <div>{loan.duration_months} months</div>
                
                <ActionButtons>
                  {loan.status === 'pending' && (
                    <>
                      <ActionButton 
                        className="approve"
                        onClick={() => handleLoanAction(loan.id, 'approve')}
                      >
                        Approve
                      </ActionButton>
                      <ActionButton 
                        className="reject"
                        onClick={() => handleLoanAction(loan.id, 'reject')}
                      >
                        Reject
                      </ActionButton>
                    </>
                  )}
                </ActionButtons>
              </TableRow>
            ))}
          </>
        )}
      </LoansTable>
      
      {totalPages > 1 && (
        <Pagination>
          <PageButton 
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </PageButton>
          
          {[...Array(totalPages)].map((_, i) => (
            <PageButton
              key={i + 1}
              className={currentPage === i + 1 ? 'active' : ''}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </PageButton>
          ))}
          
          <PageButton 
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </PageButton>
        </Pagination>
      )}
    </LoansContainer>
  );
};

export default AdminLoans;
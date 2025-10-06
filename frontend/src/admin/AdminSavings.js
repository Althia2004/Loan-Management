import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAdminAuth } from '../contexts/AdminAuthContext';

const SavingsContainer = styled.div`
  padding: 0;
  background: transparent;
  min-height: auto;
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

const FilterContainer = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
  margin-bottom: 20px;
`;

const SearchInput = styled.input`
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  min-width: 300px;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const FilterSelect = styled.select`
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  font-size: 14px;
  min-width: 120px;
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

const SavingsTable = styled.div`
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 150px;
  padding: 15px 20px;
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #eee;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 150px;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  align-items: center;
  cursor: pointer;
  
  &:hover {
    background: #f8f9fa;
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

const Amount = styled.div`
  font-weight: 600;
  color: ${props => props.color || '#333'};
  font-size: 14px;
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${props => {
      const daysSince = props.daysSinceLastDeposit;
      if (daysSince <= 30) return '#28a745';
      if (daysSince <= 90) return '#ffc107';
      return '#dc3545';
    }};
  }
  
  .text {
    font-size: 12px;
    color: #666;
  }
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
  
  &.view {
    background: #007bff;
    color: white;
    
    &:hover {
      background: #0056b3;
    }
  }
  
  &.history {
    background: #28a745;
    color: white;
    
    &:hover {
      background: #218838;
    }
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 30px;
  border-radius: 10px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  
  &:hover {
    color: #333;
  }
`;

const TransactionItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
`;

const TransactionInfo = styled.div`
  h5 {
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

const TransactionAmount = styled.div`
  font-weight: 600;
  color: ${props => props.type === 'deposit' ? '#28a745' : '#dc3545'};
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #666;
`;

const AdminSavings = () => {
  const { getAuthHeaders } = useAdminAuth();
  const [savingsAccounts, setSavingsAccounts] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userTransactions, setUserTransactions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [transactionLoading, setTransactionLoading] = useState(false);

  useEffect(() => {
    fetchSavingsData();
  }, []);

  const fetchSavingsData = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      
      const response = await fetch('/api/admin/savings', { headers });
      const data = await response.json();
      
      setSavingsAccounts(data.savings_accounts || []);
      
      // Calculate stats
      const totalAccounts = data.savings_accounts?.length || 0;
      const totalAmount = data.savings_accounts?.reduce((sum, account) => sum + account.total_balance, 0) || 0;
      const activeAccounts = data.savings_accounts?.filter(account => account.days_since_last_deposit <= 30).length || 0;
      const recentDeposits = data.savings_accounts?.filter(account => account.days_since_last_deposit <= 7).length || 0;
      
      setStats({
        totalAccounts,
        totalAmount,
        activeAccounts,
        recentDeposits
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch savings data:', error);
      setLoading(false);
    }
  };

  const fetchUserTransactions = async (userId) => {
    try {
      setTransactionLoading(true);
      const headers = getAuthHeaders();
      
      const response = await fetch(`/api/admin/savings/${userId}/transactions`, { headers });
      const data = await response.json();
      
      setUserTransactions(data.transactions || []);
      setTransactionLoading(false);
    } catch (error) {
      console.error('Failed to fetch user transactions:', error);
      setTransactionLoading(false);
    }
  };

  const handleViewTransactions = async (user) => {
    setSelectedUser(user);
    setShowModal(true);
    await fetchUserTransactions(user.user_id);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysSinceLastDeposit = (lastDepositDate) => {
    if (!lastDepositDate) return 999;
    const today = new Date();
    const lastDate = new Date(lastDepositDate);
    const diffInTime = today - lastDate;
    return Math.floor(diffInTime / (1000 * 60 * 60 * 24));
  };

  const getActivityStatus = (days) => {
    if (days <= 7) return 'Very Active';
    if (days <= 30) return 'Active';
    if (days <= 90) return 'Moderate';
    return 'Inactive';
  };

  const filteredAccounts = savingsAccounts.filter(account => {
    const matchesSearch = 
      account.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const daysSince = getDaysSinceLastDeposit(account.last_deposit_date);
    let matchesStatus = true;
    
    if (statusFilter === 'active') {
      matchesStatus = daysSince <= 30;
    } else if (statusFilter === 'inactive') {
      matchesStatus = daysSince > 90;
    } else if (statusFilter === 'moderate') {
      matchesStatus = daysSince > 30 && daysSince <= 90;
    }
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <SavingsContainer>
        <LoadingSpinner>Loading savings data...</LoadingSpinner>
      </SavingsContainer>
    );
  }

  return (
    <SavingsContainer>
      <Header>
        <PageTitle>Savings Management</PageTitle>
      </Header>

      <FilterContainer>
        <SearchInput
          type="text"
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <FilterSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active (≤30 days)</option>
          <option value="moderate">Moderate (31-90 days)</option>
          <option value="inactive">Inactive (&gt;90 days)</option>
        </FilterSelect>
      </FilterContainer>

      <StatsCards>
        <StatCard>
          <StatNumber color="#333">{stats.totalAccounts || 0}</StatNumber>
          <StatLabel>Total Accounts</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatNumber color="#28a745">{formatCurrency(stats.totalAmount || 0)}</StatNumber>
          <StatLabel>Total Savings</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatNumber color="#007bff">{stats.activeAccounts || 0}</StatNumber>
          <StatLabel>Active Accounts</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatNumber color="#17a2b8">{stats.recentDeposits || 0}</StatNumber>
          <StatLabel>Recent Deposits (7d)</StatLabel>
        </StatCard>
      </StatsCards>

      <SavingsTable>
        <TableHeader>
          <div>Customer</div>
          <div>Total Balance</div>
          <div>Last Deposit</div>
          <div>Last Deposit Date</div>
          <div>Activity Status</div>
          <div>Actions</div>
        </TableHeader>
        
        {filteredAccounts.map((account) => {
          const daysSince = getDaysSinceLastDeposit(account.last_deposit_date);
          return (
            <TableRow key={account.user_id}>
              <UserInfo>
                <h4>{account.user_name}</h4>
                <p>{account.email}</p>
              </UserInfo>
              
              <Amount color="#28a745">
                {formatCurrency(account.total_balance)}
              </Amount>
              
              <Amount>
                {account.last_deposit_amount ? formatCurrency(account.last_deposit_amount) : 'No deposits'}
              </Amount>
              
              <div>
                {account.last_deposit_date ? formatDate(account.last_deposit_date) : 'Never'}
              </div>
              
              <StatusIndicator daysSinceLastDeposit={daysSince}>
                <div className="dot"></div>
                <div className="text">{getActivityStatus(daysSince)}</div>
              </StatusIndicator>
              
              <ActionButtons>
                <ActionButton 
                  className="view"
                  onClick={() => handleViewTransactions(account)}
                >
                  View Details
                </ActionButton>
              </ActionButtons>
            </TableRow>
          );
        })}
      </SavingsTable>

      {showModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>
                Savings Transactions - {selectedUser?.user_name}
              </ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>
                ×
              </CloseButton>
            </ModalHeader>
            
            {transactionLoading ? (
              <LoadingSpinner>Loading transactions...</LoadingSpinner>
            ) : (
              <div>
                <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 10px', color: '#333' }}>Account Summary</h4>
                  <p style={{ margin: '0', color: '#666' }}>
                    <strong>Total Balance:</strong> {formatCurrency(selectedUser?.total_balance || 0)} | 
                    <strong> Total Transactions:</strong> {userTransactions.length} | 
                    <strong> Last Activity:</strong> {selectedUser?.last_deposit_date ? formatDate(selectedUser.last_deposit_date) : 'No activity'}
                  </p>
                </div>
                
                <h4 style={{ marginBottom: '15px', color: '#333' }}>Transaction History</h4>
                
                {userTransactions.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                    No transactions found for this user.
                  </p>
                ) : (
                  userTransactions.map((transaction, index) => (
                    <TransactionItem key={index}>
                      <TransactionInfo>
                        <h5>
                          {transaction.transaction_type === 'SAVINGS' ? 'Deposit' : transaction.transaction_type}
                        </h5>
                        <p>
                          {formatDate(transaction.created_at)} | 
                          ID: {transaction.transaction_id}
                        </p>
                        {transaction.description && (
                          <p>{transaction.description}</p>
                        )}
                      </TransactionInfo>
                      
                      <TransactionAmount type={transaction.transaction_type === 'SAVINGS' ? 'deposit' : 'other'}>
                        {transaction.transaction_type === 'SAVINGS' ? '+' : ''}{formatCurrency(transaction.amount)}
                      </TransactionAmount>
                    </TransactionItem>
                  ))
                )}
              </div>
            )}
          </ModalContent>
        </Modal>
      )}
    </SavingsContainer>
  );
};

export default AdminSavings;
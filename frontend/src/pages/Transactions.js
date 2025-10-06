import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';
import axios from 'axios';

const TransactionsContainer = styled.div`
  padding: 20px;
`;

const PageTitle = styled.h1`
  font-size: 32px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 30px;
`;

const UserCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const UserAvatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
`;

const UserDetails = styled.div``;

const UserName = styled.h3`
  font-size: 20px;
  margin-bottom: 4px;
`;

const UserRole = styled.p`
  opacity: 0.8;
  font-size: 14px;
`;

const CapitalInfo = styled.div`
  text-align: right;
`;

const CapitalAmount = styled.div`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 4px;
`;

const StatusBadge = styled.span`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  background-color: ${props => props.eligible ? '#c6f6d5' : '#fed7d7'};
  color: ${props => props.eligible ? '#22543d' : '#742a2a'};
`;

const TransactionsTable = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const TableTitle = styled.h3`
  margin-bottom: 20px;
  color: #2d3748;
`;

const TableHeader = styled.th`
  padding: 12px;
  text-align: left;
  border-bottom: 2px solid #e2e8f0;
  color: #4a5568;
  font-weight: 600;
  background-color: #f7fafc;
`;

const TableCell = styled.td`
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
`;

const TransactionBadge = styled.span`
  padding: 4px 8px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
  background-color: ${props => {
    switch (props.type) {
      case 'savings':
      case 'savings_deposit': return '#c6f6d5';
      case 'savings_withdrawal': return '#feebc8';
      case 'loan':
      case 'loan_disbursement': return '#feebc8';
      case 'payment':
      case 'loan_payment': return '#bee3f8';
      case 'penalty': return '#fed7d7';
      case 'account_creation': return '#e6fffa';
      default: return '#e2e8f0';
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'savings':
      case 'savings_deposit': return '#22543d';
      case 'savings_withdrawal': return '#744210';
      case 'loan':
      case 'loan_disbursement': return '#744210';
      case 'payment':
      case 'loan_payment': return '#2a4365';
      case 'penalty': return '#742a2a';
      case 'account_creation': return '#234e52';
      default: return '#4a5568';
    }
  }};
`;

const FilterContainer = styled.div`
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  background: ${props => props.active ? '#667eea' : 'white'};
  color: ${props => props.active ? 'white' : '#4a5568'};
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  
  &:hover {
    background: ${props => props.active ? '#5a67d8' : '#f7fafc'};
  }
`;

const SummaryCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
`;

const SummaryItem = styled.div`
  text-align: center;
`;

const SummaryValue = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #667eea;
`;

const SummaryLabel = styled.div`
  font-size: 12px;
  color: #718096;
  margin-top: 4px;
`;

const TransactionsCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
`;

const CardTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const UserBalance = styled.div`
  text-align: right;
`;

const BalanceAmount = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: white;
  margin-bottom: 4px;
`;

const BalanceLabel = styled.div`
  font-size: 14px;
  opacity: 0.8;
`;

const NoTransactionsMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #718096;
  font-size: 16px;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #718096;
  font-size: 16px;
`;

const Transactions = () => {
  const { user, getAuthHeaders } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const headers = getAuthHeaders();
        console.log('Fetching transactions with headers:', headers);
        const response = await axios.get('http://localhost:5000/api/transactions/', { headers });
        console.log('Transactions response:', response.data);
        setTransactions(response.data.transactions || []);
        setFilteredTransactions(response.data.transactions || []);
        setSummary(response.data.summary || {});
      } catch (error) {
        console.error('Error fetching transactions:', error);
        console.error('Error details:', error.response?.data);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTransactions();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const filterTransactions = (type) => {
    setActiveFilter(type);
    if (type === 'all') {
      setFilteredTransactions(transactions);
    } else if (type === 'savings') {
      // Show both deposits and withdrawals
      const filtered = transactions.filter(transaction => 
        transaction.type === 'savings_deposit' || transaction.type === 'savings_withdrawal'
      );
      setFilteredTransactions(filtered);
    } else {
      const filtered = transactions.filter(transaction => 
        transaction.type === type || 
        (type === 'loan_payment' && transaction.type === 'loan_payment') ||
        (type === 'loan_disbursement' && transaction.type === 'loan_disbursement')
      );
      setFilteredTransactions(filtered);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'loan_payment': return '💰';
      case 'savings_deposit': return '💎';
      case 'savings_withdrawal': return '💸';
      case 'loan_disbursement': return '🏦';
      case 'penalty': return '⚠️';
      case 'account_creation': return '🎯';
      default: return '📊';
    }
  };

  const formatTransactionType = (type) => {
    const typeMap = {
      'loan_payment': 'Loan Payment',
      'savings_deposit': 'Savings Deposit',
      'savings_withdrawal': 'Savings Withdrawal',
      'savings': 'Savings',
      'loan_disbursement': 'Loan Disbursement',
      'penalty': 'Penalty',
      'account_creation': 'Account Registration'
    };
    return typeMap[type] || type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const displayTransactions = filteredTransactions.length > 0 ? filteredTransactions : [];

  if (loading) {
    return (
      <TransactionsContainer>
        <LoadingMessage>Loading transactions...</LoadingMessage>
      </TransactionsContainer>
    );
  }

  return (
    <TransactionsContainer>
      <PageTitle>Account Transactions</PageTitle>

      <UserCard>
        <UserInfo>
          <UserAvatar>
            {getInitials(user?.first_name, user?.last_name)}
          </UserAvatar>
          <UserDetails>
            <UserName>{user?.first_name} {user?.last_name}</UserName>
            <UserRole>Member ID: {user?.id}</UserRole>
          </UserDetails>
        </UserInfo>
        <UserBalance>
          <BalanceAmount>₱{user?.capital_share?.toLocaleString() || '0'}</BalanceAmount>
          <BalanceLabel>Capital Share</BalanceLabel>
        </UserBalance>
      </UserCard>

      {/* Transaction Summary */}
      <SummaryCard>
        <h3 style={{ marginBottom: '16px', color: '#2d3748' }}>Transaction Summary</h3>
        <SummaryGrid>
          <SummaryItem>
            <SummaryValue>{summary.total_transactions || 0}</SummaryValue>
            <SummaryLabel>Total Transactions</SummaryLabel>
          </SummaryItem>
          <SummaryItem>
            <SummaryValue>{summary.total_payments || 0}</SummaryValue>
            <SummaryLabel>Loan Payments</SummaryLabel>
          </SummaryItem>
          <SummaryItem>
            <SummaryValue>{summary.total_savings || 0}</SummaryValue>
            <SummaryLabel>Savings Deposits</SummaryLabel>
          </SummaryItem>
          <SummaryItem>
            <SummaryValue>{summary.total_withdrawals || 0}</SummaryValue>
            <SummaryLabel>Savings Withdrawals</SummaryLabel>
          </SummaryItem>
          <SummaryItem>
            <SummaryValue>{summary.total_loans || 0}</SummaryValue>
            <SummaryLabel>Loan Disbursements</SummaryLabel>
          </SummaryItem>
          <SummaryItem>
            <SummaryValue style={{ color: summary.total_penalties > 0 ? '#f56565' : '#667eea' }}>
              {summary.total_penalties || 0}
            </SummaryValue>
            <SummaryLabel>Penalties</SummaryLabel>
          </SummaryItem>
        </SummaryGrid>
      </SummaryCard>

      {/* Transaction Filters */}
      <FilterContainer>
        <FilterButton 
          active={activeFilter === 'all'} 
          onClick={() => filterTransactions('all')}
        >
          All Transactions
        </FilterButton>
        <FilterButton 
          active={activeFilter === 'loan_payment'} 
          onClick={() => filterTransactions('loan_payment')}
        >
          💰 Loan Payments
        </FilterButton>
        <FilterButton 
          active={activeFilter === 'savings'} 
          onClick={() => filterTransactions('savings')}
        >
          💎 Savings (All)
        </FilterButton>
        <FilterButton 
          active={activeFilter === 'savings_deposit'} 
          onClick={() => filterTransactions('savings_deposit')}
        >
          💎 Deposits
        </FilterButton>
        <FilterButton 
          active={activeFilter === 'savings_withdrawal'} 
          onClick={() => filterTransactions('savings_withdrawal')}
        >
          💸 Withdrawals
        </FilterButton>
        <FilterButton 
          active={activeFilter === 'loan_disbursement'} 
          onClick={() => filterTransactions('loan_disbursement')}
        >
          🏦 Loans
        </FilterButton>
        <FilterButton 
          active={activeFilter === 'penalty'} 
          onClick={() => filterTransactions('penalty')}
        >
          ⚠️ Penalties
        </FilterButton>
        <FilterButton 
          active={activeFilter === 'account_creation'} 
          onClick={() => filterTransactions('account_creation')}
        >
          🎯 Registration
        </FilterButton>
      </FilterContainer>

      {/* Transactions Table */}
      <TransactionsCard>
        <CardTitle>
          {activeFilter === 'all' ? 'All Transactions' : `${formatTransactionType(activeFilter)} History`}
          <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#718096' }}>
            ({filteredTransactions.length} {filteredTransactions.length === 1 ? 'transaction' : 'transactions'})
          </span>
        </CardTitle>
        
        {displayTransactions.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <TableHeader>Date</TableHeader>
                <TableHeader>Transaction ID</TableHeader>
                <TableHeader>Type</TableHeader>
                <TableHeader>Description</TableHeader>
                <TableHeader>Amount</TableHeader>
                <TableHeader>Status</TableHeader>
              </tr>
            </thead>
            <tbody>
              {displayTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <TableCell>
                    {new Date(transaction.date).toLocaleDateString('en-PH', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </TableCell>
                  <TableCell style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                    {transaction.transaction_id}
                  </TableCell>
                  <TableCell>
                    <TransactionBadge type={transaction.type}>
                      {getTransactionIcon(transaction.type)} {formatTransactionType(transaction.type)}
                    </TransactionBadge>
                  </TableCell>
                  <TableCell style={{ maxWidth: '200px' }}>
                    {transaction.description}
                  </TableCell>
                  <TableCell style={{ 
                    fontWeight: 'bold',
                    color: transaction.type === 'penalty' ? '#f56565' : 
                           transaction.type === 'loan_disbursement' ? '#48bb78' : 
                           transaction.type === 'savings_deposit' ? '#48bb78' :
                           transaction.type === 'savings_withdrawal' ? '#f56565' :
                           transaction.type === 'loan_payment' ? '#2a4365' : '#4a5568'
                  }}>
                    {/* Show + for money coming in (loans, deposits), - for money going out (payments, withdrawals, penalties) */}
                    {transaction.type === 'loan_disbursement' || transaction.type === 'savings_deposit' ? '+' : '-'}₱{transaction.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <span style={{ 
                      padding: '2px 8px', 
                      borderRadius: '12px',
                      fontSize: '12px',
                      backgroundColor: transaction.status === 'completed' ? '#c6f6d5' : '#fed7d7',
                      color: transaction.status === 'completed' ? '#22543d' : '#742a2a'
                    }}>
                      {transaction.status}
                    </span>
                  </TableCell>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <NoTransactionsMessage>
            {activeFilter === 'all' ? 
              'No transactions found. Start by making a savings deposit or loan payment.' :
              `No ${formatTransactionType(activeFilter).toLowerCase()} transactions found.`
            }
          </NoTransactionsMessage>
        )}
      </TransactionsCard>
    </TransactionsContainer>
  );
};

export default Transactions;
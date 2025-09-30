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

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
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
      case 'savings': return '#c6f6d5';
      case 'loan': return '#feebc8';
      case 'payment': return '#bee3f8';
      case 'penalty': return '#fed7d7';
      default: return '#e2e8f0';
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'savings': return '#22543d';
      case 'loan': return '#744210';
      case 'payment': return '#2a4365';
      case 'penalty': return '#742a2a';
      default: return '#4a5568';
    }
  }};
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
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get('/api/transactions');
        setTransactions(response.data.transactions);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  // Sample data for demonstration if no transactions exist
  const sampleTransactions = [
    {
      id: 1,
      created_at: '2025-05-02',
      transaction_id: 'TXN-4829157382',
      transaction_type: 'savings',
      amount: 17500
    },
    {
      id: 2,
      created_at: '2025-04-25',
      transaction_id: 'TXN-9301746519',
      transaction_type: 'loan',
      amount: 14985.45
    },
    {
      id: 3,
      created_at: '2025-04-08',
      transaction_id: 'TXN-7162903845',
      transaction_type: 'loan',
      amount: 5000
    },
    {
      id: 4,
      created_at: '2025-04-01',
      transaction_id: 'TXN-1548379201',
      transaction_type: 'loan',
      amount: 2000
    },
    {
      id: 5,
      created_at: '2025-03-30',
      transaction_id: 'TXN-3892017465',
      transaction_type: 'savings',
      amount: 6894.37
    },
    {
      id: 6,
      created_at: '2025-03-25',
      transaction_id: 'TXN-6048193752',
      transaction_type: 'savings',
      amount: 2000
    },
    {
      id: 7,
      created_at: '2025-03-20',
      transaction_id: 'TXN-2784639105',
      transaction_type: 'penalty',
      amount: 500
    },
    {
      id: 8,
      created_at: '2025-03-01',
      transaction_id: 'TXN-8952043176',
      transaction_type: 'loan',
      amount: 8615.14
    }
  ];

  const displayTransactions = transactions.length > 0 ? transactions : sampleTransactions;

  if (loading) {
    return (
      <TransactionsContainer>
        <LoadingMessage>Loading transactions...</LoadingMessage>
      </TransactionsContainer>
    );
  }

  return (
    <TransactionsContainer>
      <PageTitle>Transactions</PageTitle>

      <UserCard>
        <UserInfo>
          <UserAvatar>
            {getInitials(user?.first_name, user?.last_name)}
          </UserAvatar>
          <UserDetails>
            <UserName>{user?.first_name} {user?.last_name}</UserName>
            <UserRole>{user?.member_status}</UserRole>
          </UserDetails>
        </UserInfo>
        <CapitalInfo>
          <CapitalAmount>{user?.capital_share?.toLocaleString()} Php</CapitalAmount>
          <StatusBadge eligible={user?.loan_eligibility}>
            {user?.loan_eligibility ? 'Eligible' : 'Not Eligible'}
          </StatusBadge>
        </CapitalInfo>
      </UserCard>

      <TransactionsTable>
        <TableTitle>Transactions</TableTitle>
        {displayTransactions.length === 0 ? (
          <NoTransactionsMessage>
            No transactions found.
          </NoTransactionsMessage>
        ) : (
          <Table>
            <thead>
              <tr>
                <TableHeader>Sl No</TableHeader>
                <TableHeader>Transaction Date</TableHeader>
                <TableHeader>Transaction Type</TableHeader>
                <TableHeader>Transaction ID</TableHeader>
                <TableHeader>Amount</TableHeader>
              </tr>
            </thead>
            <tbody>
              {displayTransactions.map((transaction, index) => (
                <tr key={transaction.id}>
                  <TableCell>{String(index + 1).padStart(2, '0')}.</TableCell>
                  <TableCell>
                    {new Date(transaction.created_at).toLocaleDateString('en-US', {
                      month: '2-digit',
                      day: '2-digit',
                      year: '2-digit'
                    })}
                  </TableCell>
                  <TableCell>
                    <TransactionBadge type={transaction.transaction_type}>
                      {transaction.transaction_type}
                    </TransactionBadge>
                  </TableCell>
                  <TableCell>{transaction.transaction_id}</TableCell>
                  <TableCell>{transaction.amount.toLocaleString()} PHP</TableCell>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </TransactionsTable>
    </TransactionsContainer>
  );
};

export default Transactions;
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';
import axios from 'axios';

const SavingsContainer = styled.div`
  padding: 20px;
`;

const PageTitle = styled.h1`
  font-size: 32px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 30px;
`;

const SavingsCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
`;

const SavingsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SavingsTitle = styled.h3`
  color: #2d3748;
  font-size: 20px;
`;

const SavingsAmount = styled.div`
  font-size: 32px;
  font-weight: bold;
  color: #48bb78;
  margin: 16px 0;
`;

const DepositForm = styled.div`
  background: #f8fff9;
  border: 1px solid #c6f6d5;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
`;

const FormTitle = styled.h4`
  color: #22543d;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FormGroup = styled.div`
  display: flex;
  gap: 16px;
  align-items: end;
`;

const Input = styled.input`
  flex: 1;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-color: #48bb78;
    box-shadow: 0 0 0 3px rgba(72, 187, 120, 0.1);
  }
`;

const Button = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: ${props => props.variant === 'danger' ? '#f56565' : '#48bb78'};
  color: white;
  
  &:hover {
    background-color: ${props => props.variant === 'danger' ? '#e53e3e' : '#38a169'};
  }
  
  &:disabled {
    background-color: #a0aec0;
    cursor: not-allowed;
  }
`;

const WithdrawForm = styled.div`
  background: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 20px;
  margin: 20px 0;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ActionCard = styled.div`
  flex: 1;
  background: ${props => props.variant === 'deposit' ? '#f8fff9' : '#fff5f5'};
  border: 1px solid ${props => props.variant === 'deposit' ? '#c6f6d5' : '#fed7d7'};
  border-radius: 8px;
  padding: 20px;
`;

const SavingsHistory = styled.div`
  margin-top: 30px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const TableHeader = styled.th`
  padding: 16px;
  text-align: left;
  border-bottom: 2px solid #e2e8f0;
  color: #4a5568;
  font-weight: 600;
  background-color: #f7fafc;
`;

const TableCell = styled.td`
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
`;

const NoSavingsMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #718096;
  font-size: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const AlertBox = styled.div`
  background-color: ${props => props.type === 'error' ? '#fed7d7' : '#d4edda'};
  color: ${props => props.type === 'error' ? '#742a2a' : '#155724'};
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid ${props => props.type === 'error' ? '#fc8181' : '#c3e6cb'};
`;

const Savings = () => {
  const { user, getAuthHeaders } = useAuth();
  const [savings, setSavings] = useState([]);
  const [totalSavings, setTotalSavings] = useState(0);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [depositing, setDepositing] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success'); // 'success' or 'error'

  useEffect(() => {
    fetchSavings();
  }, []);

  const fetchSavings = async () => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.get('http://localhost:5000/api/savings/', { headers });
      setSavings(response.data.savings);
      setTotalSavings(response.data.total_savings);
    } catch (error) {
      console.error('Error fetching savings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setMessage('Please enter a valid amount');
      setMessageType('error');
      return;
    }

    setDepositing(true);
    setMessage('');

    try {
      const headers = getAuthHeaders();
      await axios.post('http://localhost:5000/api/savings/deposit', {
        amount: parseFloat(depositAmount)
      }, { headers });
      
      setMessage('Savings deposited successfully!');
      setMessageType('success');
      setDepositAmount('');
      fetchSavings(); // Refresh savings data
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to deposit savings');
      setMessageType('error');
    } finally {
      setDepositing(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setMessage('Please enter a valid amount');
      setMessageType('error');
      return;
    }

    if (parseFloat(withdrawAmount) > totalSavings) {
      setMessage(`Insufficient funds. Available balance: ₱${totalSavings.toLocaleString()}`);
      setMessageType('error');
      return;
    }

    setWithdrawing(true);
    setMessage('');

    try {
      const headers = getAuthHeaders();
      await axios.post('http://localhost:5000/api/savings/withdraw', {
        amount: parseFloat(withdrawAmount)
      }, { headers });
      
      setMessage('Withdrawal successful!');
      setMessageType('success');
      setWithdrawAmount('');
      fetchSavings(); // Refresh savings data
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to process withdrawal');
      setMessageType('error');
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return <SavingsContainer><div>Loading savings...</div></SavingsContainer>;
  }

  return (
    <SavingsContainer>
      <PageTitle>Savings</PageTitle>

      <SavingsCard>
        <SavingsHeader>
          <SavingsTitle>Total Savings Balance</SavingsTitle>
        </SavingsHeader>
        <SavingsAmount>₱{totalSavings.toLocaleString()}</SavingsAmount>
        
        {message && (
          <AlertBox type={messageType}>
            {message}
          </AlertBox>
        )}

        <ActionButtons>
          <ActionCard variant="deposit">
            <FormTitle>
              💰 Make a Deposit
            </FormTitle>
            <form onSubmit={handleDeposit}>
              <FormGroup>
                <Input
                  type="number"
                  placeholder="Enter amount to deposit"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  min="1"
                  step="0.01"
                  required
                />
                <Button type="submit" disabled={depositing}>
                  {depositing ? 'Processing...' : 'Deposit'}
                </Button>
              </FormGroup>
            </form>
          </ActionCard>

          <ActionCard variant="withdraw">
            <FormTitle style={{ color: '#742a2a' }}>
              💸 Withdraw Savings
            </FormTitle>
            <form onSubmit={handleWithdraw}>
              <FormGroup>
                <Input
                  type="number"
                  placeholder="Enter amount to withdraw"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  min="1"
                  step="0.01"
                  max={totalSavings}
                  required
                />
                <Button type="submit" variant="danger" disabled={withdrawing || totalSavings === 0}>
                  {withdrawing ? 'Processing...' : 'Withdraw'}
                </Button>
              </FormGroup>
            </form>
            <div style={{ fontSize: '12px', color: '#718096', marginTop: '8px' }}>
              Available balance: ₱{totalSavings.toLocaleString()}
            </div>
          </ActionCard>
        </ActionButtons>
      </SavingsCard>

      <SavingsHistory>
        <h3 style={{ marginBottom: '20px', color: '#2d3748' }}>Transaction History</h3>
        {savings.length === 0 ? (
          <NoSavingsMessage>
            No transactions found. Start saving today!
          </NoSavingsMessage>
        ) : (
          <Table>
            <thead>
              <tr>
                <TableHeader>Date</TableHeader>
                <TableHeader>Type</TableHeader>
                <TableHeader>Amount</TableHeader>
                <TableHeader>Balance After</TableHeader>
                <TableHeader>Interest Rate</TableHeader>
              </tr>
            </thead>
            <tbody>
              {savings.map((saving) => (
                <tr key={saving.id}>
                  <TableCell>
                    {new Date(saving.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <span style={{ 
                      background: saving.amount >= 0 ? '#c6f6d5' : '#fed7d7',
                      color: saving.amount >= 0 ? '#22543d' : '#742a2a',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {saving.amount >= 0 ? '💰 DEPOSIT' : '💸 WITHDRAWAL'}
                    </span>
                  </TableCell>
                  <TableCell style={{ 
                    color: saving.amount >= 0 ? '#48bb78' : '#f56565',
                    fontWeight: 'bold'
                  }}>
                    {saving.amount >= 0 ? '+' : ''}₱{Math.abs(saving.amount).toLocaleString()}
                  </TableCell>
                  <TableCell>₱{saving.balance.toLocaleString()}</TableCell>
                  <TableCell>{saving.interest_rate}%</TableCell>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </SavingsHistory>
    </SavingsContainer>
  );
};

export default Savings;
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
  background-color: #48bb78;
  color: white;
  
  &:hover {
    background-color: #38a169;
  }
  
  &:disabled {
    background-color: #a0aec0;
    cursor: not-allowed;
  }
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
  background-color: #d4edda;
  color: #155724;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #c3e6cb;
`;

const Savings = () => {
  const { user } = useAuth();
  const [savings, setSavings] = useState([]);
  const [totalSavings, setTotalSavings] = useState(0);
  const [depositAmount, setDepositAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [depositing, setDepositing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSavings();
  }, []);

  const fetchSavings = async () => {
    try {
      const response = await axios.get('/api/savings');
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
      return;
    }

    setDepositing(true);
    setMessage('');

    try {
      await axios.post('/api/savings/deposit', {
        amount: parseFloat(depositAmount)
      });
      
      setMessage('Savings deposited successfully!');
      setDepositAmount('');
      fetchSavings(); // Refresh savings data
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to deposit savings');
    } finally {
      setDepositing(false);
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
          <AlertBox>
            {message}
          </AlertBox>
        )}

        <DepositForm>
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
        </DepositForm>
      </SavingsCard>

      <SavingsHistory>
        <h3 style={{ marginBottom: '20px', color: '#2d3748' }}>Savings History</h3>
        {savings.length === 0 ? (
          <NoSavingsMessage>
            No savings records found. Start saving today!
          </NoSavingsMessage>
        ) : (
          <Table>
            <thead>
              <tr>
                <TableHeader>Date</TableHeader>
                <TableHeader>Amount Deposited</TableHeader>
                <TableHeader>Current Balance</TableHeader>
                <TableHeader>Interest Rate</TableHeader>
              </tr>
            </thead>
            <tbody>
              {savings.map((saving) => (
                <tr key={saving.id}>
                  <TableCell>
                    {new Date(saving.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>₱{saving.amount.toLocaleString()}</TableCell>
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
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';
import axios from 'axios';

const AccountsContainer = styled.div`
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

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 30px;
`;

const MainContent = styled.div``;

const Sidebar = styled.div``;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3`
  color: #2d3748;
  margin-bottom: 20px;
  font-size: 18px;
`;

const PaymentHistoryTable = styled.table`
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

const PaymentForm = styled.div`
  background: #f0fff4;
  border: 1px solid #c6f6d5;
  border-radius: 8px;
  padding: 20px;
`;

const FormTitle = styled.h4`
  color: #22543d;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  color: #4a5568;
  font-weight: 600;
`;

const Input = styled.input`
  width: 100%;
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
  width: 100%;
  padding: 12px;
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

const AccountInfoCard = styled(Card)`
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
`;

const AccountNumber = styled.div`
  font-size: 24px;
  font-weight: bold;
  margin: 16px 0;
  letter-spacing: 2px;
`;

const AccountDetails = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
`;

const NoPaymentsMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #718096;
  font-size: 16px;
`;

const AlertBox = styled.div`
  background-color: #d4edda;
  color: #155724;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #c3e6cb;
`;

const Accounts = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [paymentForm, setPaymentForm] = useState({
    loan_id: '',
    amount: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await axios.get('/api/payments');
      setPayments(response.data.payments);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      await axios.post('/api/payments/make', paymentForm);
      setMessage('Payment processed successfully!');
      setPaymentForm({ loan_id: '', amount: '' });
      fetchPayments(); // Refresh payment history
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to process payment');
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  // Sample payment data for demonstration
  const samplePayments = [
    {
      id: 1,
      payment_date: new Date().toISOString(),
      payment_id: '1234',
      loan_id: '12345789',
      amount: 8674
    }
  ];

  const displayPayments = payments.length > 0 ? payments : samplePayments;

  if (loading) {
    return <AccountsContainer><div>Loading account information...</div></AccountsContainer>;
  }

  return (
    <AccountsContainer>
      <PageTitle>Accounts</PageTitle>

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
          <CapitalAmount>₱{user?.capital_share?.toLocaleString('en-PH')}</CapitalAmount>
          <StatusBadge eligible={user?.loan_eligibility}>
            {user?.loan_eligibility ? 'Eligible' : 'Not Eligible'}
          </StatusBadge>
        </CapitalInfo>
      </UserCard>

      <ContentGrid>
        <MainContent>
          <Card>
            <SectionTitle>📊 Payment History</SectionTitle>
            {displayPayments.length === 0 ? (
              <NoPaymentsMessage>
                No payment history found.
              </NoPaymentsMessage>
            ) : (
              <PaymentHistoryTable>
                <thead>
                  <tr>
                    <TableHeader>Name</TableHeader>
                    <TableHeader>Payment ID</TableHeader>
                    <TableHeader>Loan ID</TableHeader>
                    <TableHeader>Amount</TableHeader>
                  </tr>
                </thead>
                <tbody>
                  {displayPayments.map((payment) => (
                    <tr key={payment.id}>
                      <TableCell>
                        ✅ {user?.first_name} {user?.last_name}
                      </TableCell>
                      <TableCell>{payment.payment_id || '1234'}</TableCell>
                      <TableCell>{payment.loan_id || '12345789'}</TableCell>
                      <TableCell>{payment.amount.toLocaleString()}</TableCell>
                    </tr>
                  ))}
                </tbody>
              </PaymentHistoryTable>
            )}
          </Card>
        </MainContent>

        <Sidebar>
          <AccountInfoCard>
            <SectionTitle style={{ color: 'white', margin: 0 }}>My Account</SectionTitle>
            <CapitalAmount>20,000 php</CapitalAmount>
            <AccountNumber>3778 **** **** 1234</AccountNumber>
            <AccountDetails>
              <div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>ACCOUNT HOLDER</div>
                <div>{user?.first_name} {user?.last_name}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>STATUS</div>
                <div>Regular Member</div>
              </div>
            </AccountDetails>
          </AccountInfoCard>

          <Card>
            <PaymentForm>
              <FormTitle>
                ✅ New Payment
              </FormTitle>
              <div style={{ fontSize: '12px', color: '#718096', marginBottom: '16px' }}>
                Payment ID: 1234567890
              </div>
              
              {message && (
                <AlertBox>
                  {message}
                </AlertBox>
              )}

              <form onSubmit={handlePaymentSubmit}>
                <FormGroup>
                  <Label>Loan ID</Label>
                  <Input
                    type="text"
                    placeholder="Enter the given id for your loan"
                    value={paymentForm.loan_id}
                    onChange={(e) => setPaymentForm({...paymentForm, loan_id: e.target.value})}
                    required
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    placeholder="Enter the amount"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                    min="1"
                    step="0.01"
                    required
                  />
                </FormGroup>
                
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Processing...' : 'Confirm Payment'}
                </Button>
              </form>
            </PaymentForm>
          </Card>
        </Sidebar>
      </ContentGrid>
    </AccountsContainer>
  );
};

export default Accounts;
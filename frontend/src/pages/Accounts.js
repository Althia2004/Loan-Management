import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';

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

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid #e2e8f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.div`
  color: #718096;
  font-weight: 600;
`;

const InfoValue = styled.div`
  color: #2d3748;
  font-weight: 500;
  text-align: right;
`;

const PrintButton = styled(Button)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin-top: 20px;
  
  &:hover {
    opacity: 0.9;
  }
`;

const PrintableArea = styled.div`
  position: absolute;
  left: -9999px;
  top: 0;
  background: white;
  width: 210mm;
  padding: 40px;
  
  @media print {
    position: static;
    left: 0;
    display: block;
    padding: 40px;
    background: white;
  }
`;

const PrintHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 3px solid #667eea;
`;

const PrintTitle = styled.h1`
  color: #667eea;
  font-size: 32px;
  margin-bottom: 10px;
`;

const PrintSubtitle = styled.div`
  color: #718096;
  font-size: 14px;
`;

const PrintSection = styled.div`
  margin: 30px 0;
`;

const PrintSectionTitle = styled.h2`
  color: #2d3748;
  font-size: 20px;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e2e8f0;
`;

const PrintInfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f7fafc;
`;

const PrintLabel = styled.div`
  color: #718096;
  font-weight: 600;
  width: 50%;
`;

const PrintValue = styled.div`
  color: #2d3748;
  font-weight: 500;
  width: 50%;
  text-align: right;
`;

const PrintFooter = styled.div`
  margin-top: 60px;
  padding-top: 20px;
  border-top: 2px solid #e2e8f0;
  text-align: center;
  color: #718096;
  font-size: 12px;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 2px solid #e2e8f0;
`;

const Tab = styled.button`
  padding: 12px 24px;
  border: none;
  background: none;
  color: ${props => props.active ? '#667eea' : '#718096'};
  font-weight: 600;
  cursor: pointer;
  border-bottom: 2px solid ${props => props.active ? '#667eea' : 'transparent'};
  margin-bottom: -2px;
  transition: all 0.3s ease;
  
  &:hover {
    color: #667eea;
  }
`;

const LoanCard = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const LoanHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const LoanTitle = styled.h4`
  color: #2d3748;
  font-size: 18px;
  margin: 0;
`;

const LoanBadge = styled.span`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${props => {
    switch(props.status) {
      case 'approved': return '#c6f6d5';
      case 'active': return '#bee3f8';
      case 'completed': return '#d4edda';
      case 'rejected': return '#fed7d7';
      default: return '#e2e8f0';
    }
  }};
  color: ${props => {
    switch(props.status) {
      case 'approved': return '#22543d';
      case 'active': return '#2c5282';
      case 'completed': return '#155724';
      case 'rejected': return '#742a2a';
      default: return '#4a5568';
    }
  }};
  text-transform: uppercase;
`;

const Accounts = () => {
  const { user, getAuthHeaders } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [accountData, setAccountData] = useState(null);
  const [loans, setLoans] = useState([]);
  const [payments, setPayments] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef();

  useEffect(() => {
    if (user) {
      fetchAccountData();
      fetchLoans();
      fetchPayments();
    }
  }, [user]);

  const fetchAccountData = async () => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.get('http://localhost:5000/api/users/dashboard', { headers });
      setAccountData(response.data);
    } catch (error) {
      console.error('Error fetching account data:', error);
    }
  };

  const fetchLoans = async () => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.get('http://localhost:5000/api/loans/', { headers });
      // Filter to show only approved loans
      const allLoans = response.data.loans || [];
      const approvedLoans = allLoans.filter(loan => 
        loan.status.toLowerCase() === 'approved' || loan.status.toLowerCase() === 'active'
      );
      setLoans(approvedLoans);
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.get('http://localhost:5000/api/payments/', { headers });
      setPayments(response.data.payments || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Loan_Disbursement_Details_${user?.first_name}_${user?.last_name}`,
    onAfterPrint: () => console.log('Print completed'),
  });

  const handleLoanPrint = (loan) => {
    console.log('Print button clicked for loan:', loan);
    setSelectedLoan(loan);
    // Wait for state to update before printing
    setTimeout(() => {
      console.log('Triggering print...');
      if (printRef.current) {
        console.log('Print ref found:', printRef.current);
        handlePrint();
      } else {
        console.error('Print ref not found');
      }
    }, 100);
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getLoanCount = () => {
    const completedLoans = loans.filter(l => l.status === 'completed').length;
    const activeLoans = loans.filter(l => l.status === 'approved' || l.status === 'active').length;
    return { completed: completedLoans, active: activeLoans, total: loans.length };
  };

  if (loading) {
    return <AccountsContainer><div>Loading account information...</div></AccountsContainer>;
  }

  const loanCount = getLoanCount();

  return (
    <AccountsContainer>
      <PageTitle>My Account & Profile</PageTitle>

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
            {user?.loan_eligibility ? 'Eligible for Loan' : 'Not Eligible'}
          </StatusBadge>
        </CapitalInfo>
      </UserCard>

      <TabContainer>
        <Tab active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
          📊 Account Overview
        </Tab>
        <Tab active={activeTab === 'loans'} onClick={() => setActiveTab('loans')}>
          💼 Loan Details
        </Tab>
        <Tab active={activeTab === 'payments'} onClick={() => setActiveTab('payments')}>
          💳 Payment History
        </Tab>
      </TabContainer>

      {activeTab === 'overview' && (
        <ContentGrid>
          <MainContent>
            <Card>
              <SectionTitle>📋 Basic Account Information</SectionTitle>
              <InfoRow>
                <InfoLabel>Full Name</InfoLabel>
                <InfoValue>{user?.first_name} {user?.last_name}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Email Address</InfoLabel>
                <InfoValue>{user?.email}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Contact Number</InfoLabel>
                <InfoValue>{user?.contact_number}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Account Created</InfoLabel>
                <InfoValue>{formatDate(user?.created_at)}</InfoValue>
              </InfoRow>
              {user?.created_by && (
                <InfoRow>
                  <InfoLabel>Created By</InfoLabel>
                  <InfoValue>Admin: {user.created_by.username} ({user.created_by.email})</InfoValue>
                </InfoRow>
              )}
              <InfoRow>
                <InfoLabel>Last Updated</InfoLabel>
                <InfoValue>{formatDate(user?.updated_at)}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Member Status</InfoLabel>
                <InfoValue>{user?.member_status}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Capital Share</InfoLabel>
                <InfoValue style={{ color: '#48bb78', fontWeight: 'bold' }}>
                  ₱{user?.capital_share?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Loan Eligibility</InfoLabel>
                <InfoValue>
                  <StatusBadge eligible={user?.loan_eligibility}>
                    {user?.loan_eligibility ? '✓ Eligible' : '✗ Not Eligible'}
                  </StatusBadge>
                </InfoValue>
              </InfoRow>
              {!user?.loan_eligibility && (
                <InfoRow>
                  <InfoLabel>Eligibility Requirement</InfoLabel>
                  <InfoValue style={{ color: '#f56565' }}>
                    Need ₱20,000 capital share (Currently: ₱{user?.capital_share?.toLocaleString('en-PH')})
                  </InfoValue>
                </InfoRow>
              )}
            </Card>

            <Card>
              <SectionTitle>📈 Loan Statistics</SectionTitle>
              <InfoRow>
                <InfoLabel>Total Loans Applied</InfoLabel>
                <InfoValue>{loanCount.total} Loan{loanCount.total !== 1 ? 's' : ''}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Active Loans</InfoLabel>
                <InfoValue style={{ color: '#667eea', fontWeight: 'bold' }}>
                  {loanCount.active} Loan{loanCount.active !== 1 ? 's' : ''}
                </InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Completed Loans</InfoLabel>
                <InfoValue style={{ color: '#48bb78' }}>
                  {loanCount.completed} Loan{loanCount.completed !== 1 ? 's' : ''}
                </InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Total Outstanding Balance</InfoLabel>
                <InfoValue style={{ color: '#f56565', fontWeight: 'bold' }}>
                  ₱{(accountData?.total_remaining_balance || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Monthly Payment Due</InfoLabel>
                <InfoValue style={{ color: '#ed8936', fontWeight: 'bold' }}>
                  ₱{(accountData?.total_monthly_payment || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </InfoValue>
              </InfoRow>
            </Card>
          </MainContent>

          <Sidebar>
            <AccountInfoCard>
              <SectionTitle style={{ color: 'white', margin: 0 }}>💰 Capital Share</SectionTitle>
              <CapitalAmount>₱{user?.capital_share?.toLocaleString('en-PH')}</CapitalAmount>
              <AccountNumber>
                {user?.user_id ? user.user_id.substring(0, 8).toUpperCase() : 'N/A'}
              </AccountNumber>
              <AccountDetails>
                <div>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>MEMBER SINCE</div>
                  <div>{new Date(user?.created_at).getFullYear()}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>STATUS</div>
                  <div>{user?.member_status}</div>
                </div>
              </AccountDetails>
            </AccountInfoCard>

            <Card>
              <SectionTitle>ℹ️ Account Notes</SectionTitle>
              <div style={{ fontSize: '14px', color: '#718096', lineHeight: '1.6' }}>
                <p>• Keep your capital share at ₱20,000 or above to maintain loan eligibility</p>
                <p>• Make payments on time to avoid penalties</p>
                <p>• Contact support for any account issues</p>
              </div>
            </Card>
          </Sidebar>
        </ContentGrid>
      )}

      {activeTab === 'loans' && (
        <div>
          {loans.length === 0 ? (
            <Card>
              <NoPaymentsMessage>
                No loans found. {user?.loan_eligibility ? 'Apply for your first loan!' : 'Increase your capital share to ₱20,000 to be eligible for loans.'}
              </NoPaymentsMessage>
            </Card>
          ) : (
            <>
              {loans.map((loan, index) => (
                <LoanCard key={loan.id}>
                  <LoanHeader>
                    <LoanTitle>
                      {index === 0 ? '1st' : index === 1 ? '2nd' : index === 2 ? '3rd' : `${index + 1}th`} Loan Application
                    </LoanTitle>
                    <PrintButton 
                      onClick={() => handleLoanPrint(loan)}
                      style={{ padding: '8px 16px', fontSize: '14px' }}
                    >
                      🖨️ Print Details
                    </PrintButton>
                  </LoanHeader>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <InfoRow>
                        <InfoLabel>Loan ID</InfoLabel>
                        <InfoValue>{loan.loan_id}</InfoValue>
                      </InfoRow>
                      <InfoRow>
                        <InfoLabel>Loan Type</InfoLabel>
                        <InfoValue>{loan.loan_type}</InfoValue>
                      </InfoRow>
                      <InfoRow>
                        <InfoLabel>Principal Amount</InfoLabel>
                        <InfoValue style={{ color: '#667eea', fontWeight: 'bold' }}>
                          ₱{loan.principal_amount?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </InfoValue>
                      </InfoRow>
                      <InfoRow>
                        <InfoLabel>Interest Rate</InfoLabel>
                        <InfoValue>{loan.interest_rate}%</InfoValue>
                      </InfoRow>
                      <InfoRow>
                        <InfoLabel>Duration</InfoLabel>
                        <InfoValue>{loan.duration_months} Months</InfoValue>
                      </InfoRow>
                    </div>
                    <div>
                      <InfoRow>
                        <InfoLabel>Monthly Payment</InfoLabel>
                        <InfoValue style={{ color: '#ed8936', fontWeight: 'bold' }}>
                          ₱{loan.monthly_payment?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </InfoValue>
                      </InfoRow>
                      <InfoRow>
                        <InfoLabel>Remaining Balance</InfoLabel>
                        <InfoValue style={{ color: '#f56565', fontWeight: 'bold' }}>
                          ₱{loan.remaining_balance?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </InfoValue>
                      </InfoRow>
                      <InfoRow>
                        <InfoLabel>Application Date</InfoLabel>
                        <InfoValue>{formatDate(loan.created_at)}</InfoValue>
                      </InfoRow>
                      {loan.approved_at && (
                        <InfoRow>
                          <InfoLabel>Approved Date</InfoLabel>
                          <InfoValue>{formatDate(loan.approved_at)}</InfoValue>
                        </InfoRow>
                      )}
                      {loan.due_date && (
                        <InfoRow>
                          <InfoLabel>Due Date</InfoLabel>
                          <InfoValue>{formatDate(loan.due_date)}</InfoValue>
                        </InfoRow>
                      )}
                    </div>
                  </div>
                  
                  {loan.purpose && (
                    <InfoRow>
                      <InfoLabel>Purpose</InfoLabel>
                      <InfoValue>{loan.purpose}</InfoValue>
                    </InfoRow>
                  )}
                </LoanCard>
              ))}
            </>
          )}
        </div>
      )}

      {activeTab === 'payments' && (
        <Card>
          <SectionTitle>💳 Payment History</SectionTitle>
          {payments.length === 0 ? (
            <NoPaymentsMessage>
              No payment history found.
            </NoPaymentsMessage>
          ) : (
            <PaymentHistoryTable>
              <thead>
                <tr>
                  <TableHeader>Date</TableHeader>
                  <TableHeader>Payment ID</TableHeader>
                  <TableHeader>Loan ID</TableHeader>
                  <TableHeader>Amount</TableHeader>
                  <TableHeader>Status</TableHeader>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <TableCell>{formatDate(payment.payment_date)}</TableCell>
                    <TableCell>{payment.payment_id}</TableCell>
                    <TableCell>{payment.loan_id}</TableCell>
                    <TableCell>₱{payment.amount?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell>
                      <LoanBadge status={payment.status}>{payment.status}</LoanBadge>
                    </TableCell>
                  </tr>
                ))}
              </tbody>
            </PaymentHistoryTable>
          )}
        </Card>
      )}

      {/* Printable Area */}
      <PrintableArea ref={printRef}>
        <PrintHeader>
          <PrintTitle>Loan Disbursement Details</PrintTitle>
          <PrintSubtitle>Money Glitch Loan Management System</PrintSubtitle>
        </PrintHeader>

        {selectedLoan && (
          <>
            <PrintSection>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '20px' }}>
                <div>
                  <PrintLabel style={{ marginBottom: '8px' }}>Disbursement Date</PrintLabel>
                  <PrintValue style={{ textAlign: 'left', fontSize: '18px' }}>
                    {formatDate(selectedLoan.approved_at || selectedLoan.created_at)}
                  </PrintValue>
                </div>
                <div>
                  <PrintLabel style={{ marginBottom: '8px' }}>Applicant Type</PrintLabel>
                  <PrintValue style={{ textAlign: 'left', fontSize: '18px' }}>
                    {user?.member_status}
                  </PrintValue>
                </div>
              </div>
            </PrintSection>

            <PrintSection>
              <PrintSectionTitle>Disbursement</PrintSectionTitle>
              <PrintInfoRow>
                <PrintLabel>Pending Amount for Disbursement</PrintLabel>
                <PrintValue style={{ fontSize: '18px', fontWeight: 'bold' }}>
                  ₱{selectedLoan.principal_amount?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </PrintValue>
              </PrintInfoRow>
              <PrintInfoRow>
                <PrintLabel>Balance from previous Account</PrintLabel>
                <PrintValue>
                  ₱{(selectedLoan.principal_amount - selectedLoan.remaining_balance)?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </PrintValue>
              </PrintInfoRow>
              <PrintInfoRow>
                <PrintLabel>Savings 10%</PrintLabel>
                <PrintValue>
                  ₱{(selectedLoan.principal_amount * 0.10)?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </PrintValue>
              </PrintInfoRow>
            </PrintSection>

            <PrintSection>
              <PrintSectionTitle>Loan Information</PrintSectionTitle>
              <PrintInfoRow>
                <PrintLabel>Loan ID</PrintLabel>
                <PrintValue>{selectedLoan.loan_id}</PrintValue>
              </PrintInfoRow>
              <PrintInfoRow>
                <PrintLabel>Loan Type</PrintLabel>
                <PrintValue>{selectedLoan.loan_type}</PrintValue>
              </PrintInfoRow>
              <PrintInfoRow>
                <PrintLabel>Interest Rate</PrintLabel>
                <PrintValue>{selectedLoan.interest_rate}% per annum</PrintValue>
              </PrintInfoRow>
              <PrintInfoRow>
                <PrintLabel>Duration</PrintLabel>
                <PrintValue>{selectedLoan.duration_months} Months</PrintValue>
              </PrintInfoRow>
              <PrintInfoRow>
                <PrintLabel>Monthly Payment</PrintLabel>
                <PrintValue style={{ fontWeight: 'bold' }}>
                  ₱{selectedLoan.monthly_payment?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </PrintValue>
              </PrintInfoRow>
              <PrintInfoRow>
                <PrintLabel>Remaining Balance</PrintLabel>
                <PrintValue style={{ fontWeight: 'bold', color: '#f56565' }}>
                  ₱{selectedLoan.remaining_balance?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </PrintValue>
              </PrintInfoRow>
            </PrintSection>

            <PrintSection>
              <PrintSectionTitle>Borrower Information</PrintSectionTitle>
              <PrintInfoRow>
                <PrintLabel>Name</PrintLabel>
                <PrintValue>{user?.first_name} {user?.last_name}</PrintValue>
              </PrintInfoRow>
              <PrintInfoRow>
                <PrintLabel>Email</PrintLabel>
                <PrintValue>{user?.email}</PrintValue>
              </PrintInfoRow>
              <PrintInfoRow>
                <PrintLabel>Contact Number</PrintLabel>
                <PrintValue>{user?.contact_number}</PrintValue>
              </PrintInfoRow>
              <PrintInfoRow>
                <PrintLabel>Member Status</PrintLabel>
                <PrintValue>{user?.member_status}</PrintValue>
              </PrintInfoRow>
              <PrintInfoRow>
                <PrintLabel>Capital Share</PrintLabel>
                <PrintValue>₱{user?.capital_share?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</PrintValue>
              </PrintInfoRow>
              <PrintInfoRow>
                <PrintLabel>Account Created</PrintLabel>
                <PrintValue>{formatDate(user?.created_at)}</PrintValue>
              </PrintInfoRow>
              {user?.created_by && (
                <PrintInfoRow>
                  <PrintLabel>Account Created By</PrintLabel>
                  <PrintValue>Admin: {user.created_by.username}</PrintValue>
                </PrintInfoRow>
              )}
            </PrintSection>

            <PrintFooter>
              <div>Document generated on {new Date().toLocaleString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</div>
              <div style={{ marginTop: '10px' }}>Money Glitch Loan Management System</div>
              <div>This is an automatically generated document.</div>
            </PrintFooter>
          </>
        )}
      </PrintableArea>
    </AccountsContainer>
  );
};

export default Accounts;
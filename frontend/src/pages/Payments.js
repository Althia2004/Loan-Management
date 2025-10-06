import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import QRCode from 'qrcode';

const PaymentsContainer = styled.div`
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
`;

const PageTitle = styled.h1`
  font-size: 32px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 10px;
`;

const PageSubtitle = styled.p`
  font-size: 16px;
  color: #718096;
  margin-bottom: 30px;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
`;

const CardTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const LoanSelector = styled.div`
  margin-bottom: 20px;
`;

const LoanOption = styled.div`
  padding: 16px;
  border: 2px solid ${props => props.selected ? '#667eea' : '#e2e8f0'};
  border-radius: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.selected ? '#f7fafc' : 'white'};

  &:hover {
    border-color: #667eea;
    background: #f7fafc;
  }
`;

const LoanInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const LoanLabel = styled.span`
  font-size: 14px;
  color: #718096;
`;

const LoanValue = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
`;

const AmountSelector = styled.div`
  margin-bottom: 20px;
`;

const AmountOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
`;

const AmountButton = styled.button`
  padding: 12px;
  border: 2px solid ${props => props.selected ? '#667eea' : '#e2e8f0'};
  border-radius: 8px;
  background: ${props => props.selected ? '#667eea' : 'white'};
  color: ${props => props.selected ? 'white' : '#2d3748'};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #667eea;
    background: ${props => props.selected ? '#667eea' : '#f7fafc'};
  }
`;

const CustomAmountInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const PaymentButton = styled.button`
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 20px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    background: #cbd5e0;
    cursor: not-allowed;
    transform: none;
  }
`;

const QRCodeContainer = styled.div`
  text-align: center;
  padding: 20px;
`;

const QRCodeImage = styled.img`
  width: 300px;
  height: 300px;
  margin: 20px auto;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  background: white;
`;

const PaymentInfo = styled.div`
  background: #f7fafc;
  padding: 16px;
  border-radius: 8px;
  margin-top: 20px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e2e8f0;

  &:last-child {
    border-bottom: none;
    font-weight: 600;
    font-size: 18px;
    color: #667eea;
    margin-top: 8px;
    padding-top: 12px;
  }
`;

const InfoLabel = styled.span`
  color: #718096;
  font-size: 14px;
`;

const InfoValue = styled.span`
  color: #2d3748;
  font-weight: 600;
  font-size: 14px;
`;

const Instructions = styled.div`
  background: #edf2f7;
  padding: 16px;
  border-radius: 8px;
  margin-top: 20px;
`;

const InstructionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 12px;
`;

const InstructionList = styled.ol`
  margin: 0;
  padding-left: 20px;
  color: #4a5568;
  font-size: 14px;
  line-height: 1.8;
`;

const NoLoansMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #718096;
  font-size: 16px;
`;

const DownloadButton = styled.button`
  padding: 10px 20px;
  background: #48bb78;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 12px;
  transition: all 0.3s ease;

  &:hover {
    background: #38a169;
    transform: translateY(-2px);
  }
`;

const ConfirmPaymentButton = styled.button`
  width: 100%;
  padding: 14px 20px;
  background: #0066ff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 20px;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: #0052cc;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 102, 255, 0.3);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const PaymentMethodSelector = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
`;

const PaymentMethodButton = styled.button`
  padding: 16px;
  border: 2px solid ${props => props.selected ? '#667eea' : '#e2e8f0'};
  border-radius: 8px;
  background: ${props => props.selected ? '#667eea' : 'white'};
  color: ${props => props.selected ? 'white' : '#2d3748'};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    border-color: #667eea;
    background: ${props => props.selected ? '#667eea' : '#f7fafc'};
  }
`;

const CardForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FormLabel = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
`;

const FormInput = styled.input`
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
  }

  &::placeholder {
    color: #a0aec0;
  }
`;

const CardPreview = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 24px;
  color: white;
  margin-bottom: 20px;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
`;

const CardChip = styled.div`
  width: 50px;
  height: 40px;
  background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%);
  border-radius: 8px;
  margin-bottom: 20px;
`;

const CardNumber = styled.div`
  font-size: 24px;
  letter-spacing: 4px;
  margin-bottom: 20px;
  font-family: 'Courier New', monospace;
`;

const CardInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;

const CardName = styled.div`
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const CardExpiry = styled.div`
  font-size: 14px;
  letter-spacing: 1px;
`;

const CardType = styled.div`
  text-align: right;
  font-size: 18px;
  font-weight: bold;
  opacity: 0.9;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const SuccessMessage = styled.div`
  background: #c6f6d5;
  border: 2px solid #48bb78;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  color: #22543d;
  font-weight: 600;
  margin-top: 20px;
`;

const ErrorMessage = styled.div`
  background: #fed7d7;
  border: 2px solid #f56565;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  color: #742a2a;
  font-weight: 600;
  margin-top: 20px;
`;

const Payments = () => {
  const { user, getAuthHeaders } = useAuth();
  const [loans, setLoans] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [selectedAmountType, setSelectedAmountType] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('gcash'); // 'gcash' or 'card'
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    fetchLoans();
  }, [user]);

  const fetchLoans = async () => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.get('http://localhost:5000/api/loans/', { headers });
      const activeLoans = response.data.loans.filter(
        loan => loan.status === 'approved' || loan.status === 'active'
      );
      setLoans(activeLoans);
      if (activeLoans.length > 0) {
        setSelectedLoan(activeLoans[0]);
      }
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoanSelect = (loan) => {
    setSelectedLoan(loan);
    setPaymentAmount('');
    setSelectedAmountType('');
    setQrCodeUrl('');
    setPaymentSuccess(false);
  };

  const handleAmountSelect = (type) => {
    setSelectedAmountType(type);
    if (type === 'monthly') {
      setPaymentAmount(selectedLoan.monthly_payment.toString());
    } else if (type === 'remaining') {
      setPaymentAmount(selectedLoan.remaining_balance.toString());
    } else {
      setPaymentAmount('');
    }
    setPaymentSuccess(false);
  };

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    
    let formattedValue = value;
    
    if (name === 'cardNumber') {
      // Remove non-digits and limit to 16 digits
      formattedValue = value.replace(/\D/g, '').slice(0, 16);
      // Add spaces every 4 digits
      formattedValue = formattedValue.replace(/(\d{4})/g, '$1 ').trim();
    } else if (name === 'expiryDate') {
      // Format as MM/YY
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2);
      }
    } else if (name === 'cvv') {
      // Limit to 3-4 digits
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    } else if (name === 'cardName') {
      // Only letters and spaces
      formattedValue = value.replace(/[^a-zA-Z\s]/g, '').toUpperCase();
    }
    
    setCardDetails(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  const getCardType = (cardNumber) => {
    const number = cardNumber.replace(/\s/g, '');
    if (number.startsWith('4')) return 'VISA';
    if (number.startsWith('5')) return 'MASTERCARD';
    if (number.startsWith('3')) return 'AMEX';
    return 'CARD';
  };

  const handleCardPayment = async (e) => {
    e.preventDefault();
    
    // Validate card details
    const cardNumber = cardDetails.cardNumber.replace(/\s/g, '');
    if (cardNumber.length < 15 || cardNumber.length > 16) {
      alert('Please enter a valid card number');
      return;
    }
    
    if (!cardDetails.cardName || cardDetails.cardName.length < 3) {
      alert('Please enter the cardholder name');
      return;
    }
    
    if (cardDetails.expiryDate.length !== 5) {
      alert('Please enter a valid expiry date (MM/YY)');
      return;
    }
    
    if (cardDetails.cvv.length < 3) {
      alert('Please enter a valid CVV');
      return;
    }
    
    // Simulate payment processing
    setLoading(true);
    
    try {
      // Simulate card processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Record payment in the database
      const headers = getAuthHeaders();
      const paymentData = {
        loan_id: selectedLoan.id,
        amount: parseFloat(paymentAmount),
        payment_method: 'card'
      };
      
      const response = await axios.post(
        'http://localhost:5000/api/payments/make',
        paymentData,
        { headers }
      );
      
      if (response.data) {
        setPaymentSuccess(true);
        
        // Clear form
        setCardDetails({
          cardNumber: '',
          cardName: '',
          expiryDate: '',
          cvv: ''
        });
        
        // Reset payment selection
        setPaymentAmount('');
        setSelectedAmountType('');
        
        // Refresh loans after payment
        await fetchLoans();
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async () => {
    if (!selectedLoan || !paymentAmount) return;

    const gcashInfo = {
      merchant: 'Money Glitch Cooperative',
      merchantId: 'MGLITCH2024',
      amount: parseFloat(paymentAmount),
      reference: `LOAN-${selectedLoan.loan_id}`,
      description: `Loan Payment for ${selectedLoan.loan_id}`
    };

    // GCash QR Code format (simplified)
    const qrData = JSON.stringify(gcashInfo);

    try {
      const url = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      setQrCodeUrl(url);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `payment-qr-${selectedLoan.loan_id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGCashPayment = async () => {
    if (!selectedLoan || !paymentAmount) return;
    
    setLoading(true);
    
    try {
      // Record GCash payment in the database
      const headers = getAuthHeaders();
      const paymentData = {
        loan_id: selectedLoan.id,
        amount: parseFloat(paymentAmount),
        payment_method: 'gcash'
      };
      
      const response = await axios.post(
        'http://localhost:5000/api/payments/make',
        paymentData,
        { headers }
      );
      
      if (response.data) {
        setPaymentSuccess(true);
        
        // Reset payment selection
        setPaymentAmount('');
        setSelectedAmountType('');
        setQrCodeUrl('');
        
        // Refresh loans after payment
        await fetchLoans();
        
        alert('GCash payment recorded successfully!');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to record payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PaymentsContainer><div>Loading payment options...</div></PaymentsContainer>;
  }

  if (loans.length === 0) {
    return (
      <PaymentsContainer>
        <PageTitle>Pay Loan</PageTitle>
        <PageSubtitle>Make payments for your active loans</PageSubtitle>
        <Card>
          <NoLoansMessage>
            No active loans found. You don't have any loans to pay at the moment.
          </NoLoansMessage>
        </Card>
      </PaymentsContainer>
    );
  }

  return (
    <PaymentsContainer>
      <PageTitle>Pay Loan</PageTitle>
      <PageSubtitle>Select a loan and choose your payment method - GCash or Card</PageSubtitle>

      <ContentGrid>
        <div>
          <Card>
            <CardTitle>🏦 Select Loan to Pay</CardTitle>
            <LoanSelector>
              {loans.map((loan, index) => (
                <LoanOption
                  key={loan.id}
                  selected={selectedLoan?.id === loan.id}
                  onClick={() => handleLoanSelect(loan)}
                >
                  <LoanInfo>
                    <LoanLabel>Loan {index + 1} - {loan.loan_type}</LoanLabel>
                    <LoanValue>ID: {loan.loan_id}</LoanValue>
                  </LoanInfo>
                  <LoanInfo>
                    <LoanLabel>Monthly Payment</LoanLabel>
                    <LoanValue style={{ color: '#667eea' }}>
                      ₱{loan.monthly_payment?.toLocaleString()}
                    </LoanValue>
                  </LoanInfo>
                  <LoanInfo>
                    <LoanLabel>Remaining Balance</LoanLabel>
                    <LoanValue style={{ color: '#f56565' }}>
                      ₱{loan.remaining_balance?.toLocaleString()}
                    </LoanValue>
                  </LoanInfo>
                </LoanOption>
              ))}
            </LoanSelector>
          </Card>

          {selectedLoan && (
            <>
              <Card style={{ marginTop: '20px' }}>
                <CardTitle>💰 Select Payment Amount</CardTitle>
                <AmountSelector>
                  <AmountOptions>
                    <AmountButton
                      selected={selectedAmountType === 'monthly'}
                      onClick={() => handleAmountSelect('monthly')}
                    >
                      Monthly Payment
                      <br />
                      <strong>₱{selectedLoan.monthly_payment?.toLocaleString()}</strong>
                    </AmountButton>
                    <AmountButton
                      selected={selectedAmountType === 'remaining'}
                      onClick={() => handleAmountSelect('remaining')}
                    >
                      Full Balance
                      <br />
                      <strong>₱{selectedLoan.remaining_balance?.toLocaleString()}</strong>
                    </AmountButton>
                    <AmountButton
                      selected={selectedAmountType === 'custom'}
                      onClick={() => handleAmountSelect('custom')}
                      style={{ gridColumn: 'span 2' }}
                    >
                      Custom Amount
                    </AmountButton>
                  </AmountOptions>
                  {selectedAmountType === 'custom' && (
                    <CustomAmountInput
                      type="number"
                      placeholder="Enter custom amount"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      min="1"
                      max={selectedLoan.remaining_balance}
                    />
                  )}
                </AmountSelector>
              </Card>

              <Card style={{ marginTop: '20px' }}>
                <CardTitle>💳 Select Payment Method</CardTitle>
                <PaymentMethodSelector>
                  <PaymentMethodButton
                    selected={paymentMethod === 'gcash'}
                    onClick={() => setPaymentMethod('gcash')}
                  >
                    <span>📱</span>
                    GCash
                  </PaymentMethodButton>
                  <PaymentMethodButton
                    selected={paymentMethod === 'card'}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <span>💳</span>
                    Credit/Debit Card
                  </PaymentMethodButton>
                </PaymentMethodSelector>

                {paymentMethod === 'gcash' ? (
                  <PaymentButton
                    onClick={generateQRCode}
                    disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
                  >
                    Generate GCash QR Code
                  </PaymentButton>
                ) : (
                  <div>
                    <CardPreview>
                      <div>
                        <CardChip />
                        <CardType>{getCardType(cardDetails.cardNumber)}</CardType>
                      </div>
                      <CardNumber>
                        {cardDetails.cardNumber || '•••• •••• •••• ••••'}
                      </CardNumber>
                      <CardInfo>
                        <div>
                          <div style={{ fontSize: '10px', opacity: 0.7 }}>CARDHOLDER NAME</div>
                          <CardName>{cardDetails.cardName || 'YOUR NAME'}</CardName>
                        </div>
                        <div>
                          <div style={{ fontSize: '10px', opacity: 0.7 }}>EXPIRES</div>
                          <CardExpiry>{cardDetails.expiryDate || 'MM/YY'}</CardExpiry>
                        </div>
                      </CardInfo>
                    </CardPreview>

                    <CardForm onSubmit={handleCardPayment}>
                      <FormGroup>
                        <FormLabel>Card Number</FormLabel>
                        <FormInput
                          type="text"
                          name="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={cardDetails.cardNumber}
                          onChange={handleCardInputChange}
                          required
                        />
                      </FormGroup>

                      <FormGroup>
                        <FormLabel>Cardholder Name</FormLabel>
                        <FormInput
                          type="text"
                          name="cardName"
                          placeholder="JOHN DOE"
                          value={cardDetails.cardName}
                          onChange={handleCardInputChange}
                          required
                        />
                      </FormGroup>

                      <FormRow>
                        <FormGroup>
                          <FormLabel>Expiry Date</FormLabel>
                          <FormInput
                            type="text"
                            name="expiryDate"
                            placeholder="MM/YY"
                            value={cardDetails.expiryDate}
                            onChange={handleCardInputChange}
                            required
                          />
                        </FormGroup>

                        <FormGroup>
                          <FormLabel>CVV</FormLabel>
                          <FormInput
                            type="password"
                            name="cvv"
                            placeholder="123"
                            value={cardDetails.cvv}
                            onChange={handleCardInputChange}
                            maxLength="4"
                            required
                          />
                        </FormGroup>
                      </FormRow>

                      <PaymentButton
                        type="submit"
                        disabled={!paymentAmount || parseFloat(paymentAmount) <= 0 || loading}
                      >
                        {loading ? 'Processing...' : `Pay ₱${parseFloat(paymentAmount || 0).toLocaleString()}`}
                      </PaymentButton>
                    </CardForm>

                    {paymentSuccess && (
                      <SuccessMessage>
                        ✅ Payment Successful! Your payment of ₱{parseFloat(paymentAmount).toLocaleString()} has been processed.
                      </SuccessMessage>
                    )}
                  </div>
                )}
              </Card>
            </>
          )}
        </div>

        <div>
          {qrCodeUrl ? (
            <Card>
              <CardTitle>📱 GCash QR Code</CardTitle>
              <QRCodeContainer>
                <QRCodeImage src={qrCodeUrl} alt="GCash Payment QR Code" />
                <DownloadButton onClick={downloadQRCode}>
                  ⬇️ Download QR Code
                </DownloadButton>
              </QRCodeContainer>

              <PaymentInfo>
                <InfoRow>
                  <InfoLabel>Merchant</InfoLabel>
                  <InfoValue>Money Glitch Cooperative</InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>Loan ID</InfoLabel>
                  <InfoValue>{selectedLoan.loan_id}</InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>Payment Type</InfoLabel>
                  <InfoValue>
                    {selectedAmountType === 'monthly' ? 'Monthly Payment' : 
                     selectedAmountType === 'remaining' ? 'Full Payment' : 'Custom Amount'}
                  </InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>Amount to Pay</InfoLabel>
                  <InfoValue>₱{parseFloat(paymentAmount).toLocaleString()}</InfoValue>
                </InfoRow>
              </PaymentInfo>

              <Instructions>
                <InstructionTitle>📋 Payment Instructions</InstructionTitle>
                <InstructionList>
                  <li>Open your GCash app on your mobile phone</li>
                  <li>Tap on "Scan QR" from the home screen</li>
                  <li>Point your camera at the QR code displayed above</li>
                  <li>Verify the payment details (Amount, Reference)</li>
                  <li>Enter your MPIN to confirm the payment</li>
                  <li>Save the receipt for your records</li>
                  <li>After completing the payment, click the button below</li>
                </InstructionList>
              </Instructions>

              <ConfirmPaymentButton onClick={handleGCashPayment} disabled={loading}>
                {loading ? '⏳ Processing...' : '✅ Confirm Payment Completed'}
              </ConfirmPaymentButton>
            </Card>
          ) : (
            <Card>
              <CardTitle>📱 GCash Payment</CardTitle>
              <NoLoansMessage>
                Select a loan and amount, then click "Generate GCash QR Code" to create your payment QR code.
              </NoLoansMessage>
            </Card>
          )}
        </div>
      </ContentGrid>
    </PaymentsContainer>
  );
};

export default Payments;

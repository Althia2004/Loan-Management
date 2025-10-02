import React from 'react';
import styled from 'styled-components';
import { useAdminAuth } from '../contexts/AdminAuthContext';

const HeaderContainer = styled.header`
  background: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  
  h1 {
    margin: 0;
    color: #333;
    font-size: 20px;
  }
  
  span {
    color: #667eea;
    font-size: 18px;
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const UserInfo = styled.div`
  text-align: right;
  
  h3 {
    margin: 0;
    font-size: 14px;
    color: #333;
  }
  
  p {
    margin: 0;
    font-size: 12px;
    color: #666;
  }
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #667eea;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
`;

const LogoutButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  
  &:hover {
    background: #c82333;
  }
`;

const AdminHeader = () => {
  const { admin, logout } = useAdminAuth();

  return (
    <HeaderContainer>
      <Logo>
        <span>💰</span>
        <h1>Money Glitch - Admin</h1>
      </Logo>
      
      <UserSection>
        <UserInfo>
          <h3>{admin?.first_name} {admin?.last_name}</h3>
          <p>{admin?.role?.replace('_', ' ')}</p>
        </UserInfo>
        <UserAvatar>
          {admin?.first_name?.charAt(0)}{admin?.last_name?.charAt(0)}
        </UserAvatar>
        <LogoutButton onClick={logout}>
          Logout
        </LogoutButton>
      </UserSection>
    </HeaderContainer>
  );
};

export default AdminHeader;
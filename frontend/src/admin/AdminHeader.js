import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';

const HeaderContainer = styled.header`
  background: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 70px;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  
  h1 {
    margin: 0;
    color: #2d3748;
    font-size: 22px;
    font-weight: 700;
  }
`;

const LogoIcon = styled.div`
  width: 45px;
  height: 45px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 22px;
  font-weight: bold;
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
`;

const AdminBadge = styled.span`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  margin-left: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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
    font-size: 15px;
    color: #2d3748;
    font-weight: 600;
  }
  
  p {
    margin: 0;
    font-size: 13px;
    color: #718096;
    text-transform: capitalize;
  }
`;

const UserAvatar = styled.div`
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 16px;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
`;

const LogoutButton = styled.button`
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(220, 53, 69, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
  }
`;

const AdminHeader = () => {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirect to main login page
  };

  return (
    <HeaderContainer>
      <Logo>
        <LogoIcon>$</LogoIcon>
        <div>
          <h1>
            Money Glitch
            <AdminBadge>Admin Portal</AdminBadge>
          </h1>
        </div>
      </Logo>
      
      <UserSection>
        <UserInfo>
          <h3>{admin?.first_name} {admin?.last_name}</h3>
          <p>{admin?.role?.replace('_', ' ')}</p>
        </UserInfo>
        <UserAvatar>
          {admin?.first_name?.charAt(0)}{admin?.last_name?.charAt(0)}
        </UserAvatar>
        <LogoutButton onClick={handleLogout}>
          🚪 Logout
        </LogoutButton>
      </UserSection>
    </HeaderContainer>
  );
};

export default AdminHeader;
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  background: white;
  padding: 16px 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SearchContainer = styled.div`
  flex: 1;
  max-width: 400px;
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 16px 8px 40px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #7c5dfa;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const NotificationIcon = styled.div`
  position: relative;
  cursor: pointer;
  font-size: 20px;
  color: #a0aec0;
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
`;

const UserInfo = styled.div`
  text-align: right;
`;

const UserName = styled.div`
  font-weight: 600;
  color: #2d3748;
`;

const UserRole = styled.div`
  font-size: 12px;
  color: #718096;
`;

const Header = () => {
  const { user } = useAuth();

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <HeaderContainer>
      <SearchContainer>
        <SearchIcon>🔍</SearchIcon>
        <SearchInput placeholder="Search for something" />
      </SearchContainer>
      
      <UserSection>
        <NotificationIcon>🔔</NotificationIcon>
        <UserProfile>
          <UserInfo>
            <UserName>{user?.first_name} {user?.last_name}</UserName>
            <UserRole>{user?.member_status}</UserRole>
          </UserInfo>
          <UserAvatar>
            {getInitials(user?.first_name, user?.last_name)}
          </UserAvatar>
        </UserProfile>
      </UserSection>
    </HeaderContainer>
  );
};

export default Header;
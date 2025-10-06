import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

const SidebarContainer = styled.div`
  width: 250px;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  color: white;
  height: calc(100vh - 70px);
  position: fixed;
  left: 0;
  top: 70px;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 999;
  overflow-y: auto;
`;

const Logo = styled.div`
  padding: 30px 20px;
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const LogoIcon = styled.div`
  width: 45px;
  height: 45px;
  background: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: #667eea;
  font-weight: bold;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const LogoText = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: white;
  margin-top: 8px;
`;

const AdminBadge = styled.div`
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const NavList = styled.ul`
  list-style: none;
  padding: 20px 0;
  margin: 0;
  flex: 1;
`;

const NavItem = styled.li`
  margin-bottom: 4px;
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 15px 25px;
  color: white;
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 16px;
  gap: 12px;
  font-weight: 500;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    padding-left: 30px;
  }

  &.active {
    background: rgba(255, 255, 255, 0.2);
    border-left: 4px solid white;
    padding-left: 21px;
    font-weight: 600;
  }
`;

const NavIcon = styled.span`
  font-size: 20px;
  width: 24px;
  display: inline-block;
  text-align: center;
`;

const AdminSidebar = () => {
  const navItems = [
    { path: '/admin/dashboard', icon: '🏠', label: 'Dashboard' },
    { path: '/admin/loans', icon: '💳', label: 'Loans' },
    { path: '/admin/users', icon: '👥', label: 'Users' },
    { path: '/admin/transactions', icon: '📊', label: 'Activity Log' },
    { path: '/admin/savings', icon: '💰', label: 'Savings' },
    { path: '/admin/reports', icon: '📈', label: 'Reports' },
    { path: '/admin/settings', icon: '⚙️', label: 'Settings' },
  ];

  return (
    <SidebarContainer>
      <Logo>
        <LogoIcon>$</LogoIcon>
        <LogoText>Money Glitch</LogoText>
        <AdminBadge>Admin Panel</AdminBadge>
      </Logo>
      
      <NavList>
        {navItems.map((item) => (
          <NavItem key={item.path}>
            <StyledNavLink to={item.path}>
              <NavIcon>{item.icon}</NavIcon>
              {item.label}
            </StyledNavLink>
          </NavItem>
        ))}
      </NavList>
    </SidebarContainer>
  );
};

export default AdminSidebar;
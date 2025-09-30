import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import styled from 'styled-components';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 250px;
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 20px;
  background-color: #f8f9fa;
`;

const Layout = () => {
  return (
    <LayoutContainer>
      <Sidebar />
      <MainContent>
        <Header />
        <ContentArea>
          <Outlet />
        </ContentArea>
      </MainContent>
    </LayoutContainer>
  );
};

export default Layout;
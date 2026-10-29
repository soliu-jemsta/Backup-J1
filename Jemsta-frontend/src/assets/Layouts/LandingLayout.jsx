import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../../LandingPage/Header';
import Footer from '../../LandingPage/Footer';

function LandingLayout() {
  // const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}

export default LandingLayout;

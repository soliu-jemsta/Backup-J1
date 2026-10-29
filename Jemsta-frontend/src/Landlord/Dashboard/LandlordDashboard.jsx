import React, { useState } from 'react';
// import Sidebar from '../../components/Sidebar';
// import Header from '../../components/Header';
import MainContent from './MainContent';

const LandlordDashboard = () => {
//   const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      {/* Main Content */}
      {/* <div className="flex-1 flex flex-col overflow-hidden"> */}
        {/* <Header setSidebarOpen={setSidebarOpen} /> */}
        <MainContent />
      {/* </div> */}
    </>
  );
};

export default LandlordDashboard;

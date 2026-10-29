import React, { useState } from 'react';
import AdminHeader from '../../components/AdminHeader';
import AdminSidebar from '../../components/AdminSidebar';
import { Outlet } from 'react-router-dom';

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-green-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;

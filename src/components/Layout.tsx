import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex w-full">
        <Sidebar />
        <div className="flex-1 lg:ml-72">
          <Header />
          <main className="p-4 lg:p-6 min-h-[calc(100vh-4rem)]">
            <div className="w-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;

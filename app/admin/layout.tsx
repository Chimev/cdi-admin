

import React from 'react';
import { SideBar } from '@/components/Layouts/SideBar';
import { Header } from '@/components/Layouts/Header';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/auth';
import { redirect } from 'next/navigation';
import { UserProvider } from '@/context/UserContext';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session: any = await getServerSession(authOptions)

   if (!session || !session.user) {
    redirect('/auth');
  }

  return (
    <UserProvider id={session?.user?.id}>
      <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <SideBar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <Header />

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
          {children}
        </div>
      </main>
    </div>
    
    </UserProvider>
    
  );
}
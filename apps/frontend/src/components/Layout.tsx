import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Home, CreditCard, Target, Settings, PieChart, Menu } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigation = [
    { name: 'Dashboard', icon: Home, href: '/dashboard' },
    { name: 'Transactions', icon: CreditCard, href: '/transactions' },
    { name: 'Budgets', icon: PieChart, href: '/budgets' },
    { name: 'Goals', icon: Target, href: '/goals' },
    { name: 'Settings', icon: Settings, href: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-16 items-center justify-between px-4 bg-white shadow sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button className="lg:hidden inline-flex items-center justify-center p-2 rounded-md border border-gray-200" onClick={() => setOpen(v => !v)}>
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Finance Manager</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center">
            <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="ml-3 hidden md:block">
              <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          <button onClick={logout} className="p-2 rounded-md border border-gray-200 text-gray-600 hover:text-gray-800">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="flex">
        <aside className={`fixed z-40 inset-y-16 left-0 w-72 transform bg-white border-r border-gray-200 p-4 transition-transform lg:static lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'} lg:w-64`}>
          <nav className="space-y-1">
            {navigation.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `group flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'
                    }`
                  }
                >
                  <Icon className="mr-3 h-5 w-5 text-gray-400 group-[.active]:text-indigo-600" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
        </aside>
        <main className="flex-1 lg:ml-64 w-full p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Plus, 
  BarChart3, 
  Users, 
  Target, 
  User, 
  Settings,
  Menu,
  X,
  Wallet,
  TrendingUp,
  Calendar,
  Receipt,
  PiggyBank,
  CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarItems = [
  { icon: Home, label: 'Dashboard', href: '/', category: 'main' },
  { icon: Plus, label: 'Add Expense', href: '/add-expense', category: 'main' },
  { icon: BarChart3, label: 'Analytics', href: '/analytics', category: 'insights' },
  { icon: TrendingUp, label: 'Reports', href: '/reports', category: 'insights' },
  { icon: Users, label: 'Groups', href: '/groups', category: 'social' },
  { icon: Target, label: 'Goals', href: '/goals', category: 'planning' },
  { icon: Calendar, label: 'Recurring', href: '/recurring', category: 'planning' },
  { icon: User, label: 'Profile', href: '/profile', category: 'account' },
];

const categoryIcons = {
  main: Receipt,
  insights: BarChart3,
  social: Users,
  planning: Target,
  account: User
};

const Sidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
            <Wallet className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Expenza</h1>
            <p className="text-xs text-muted-foreground">Smart Finance Tracker</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6">
        {/* Main Actions */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 px-3 mb-3">
            <Receipt className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Main</span>
          </div>
          {sidebarItems.filter(item => item.category === 'main').map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                )} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Insights */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 px-3 mb-3">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Insights</span>
          </div>
          {sidebarItems.filter(item => item.category === 'insights').map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                )} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Social & Planning */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 px-3 mb-3">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Social & Planning</span>
          </div>
          {sidebarItems.filter(item => ['social', 'planning'].includes(item.category)).map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                )} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-border space-y-2">
        <Link
          to="/profile"
          className="flex items-center space-x-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200"
        >
          <User className="w-5 h-5" />
          <span className="font-medium">Profile</span>
        </Link>
        <Link
          to="/settings"
          className="flex items-center space-x-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200"
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-card border border-border shadow-lg"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Desktop sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 bottom-0 w-72 border-r border-border shadow-sm">
        <SidebarContent />
      </div>

      {/* Mobile sidebar overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 border-r border-border shadow-lg">
            <div className="flex justify-end p-4">
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-2 rounded-lg hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;

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
  CreditCard // Added CreditCard for Passbook
} from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarItems = [
  { icon: Home, label: 'Dashboard', href: '/', category: 'main' },
  { icon: Plus, label: 'Add Expense', href: '/add-expense', category: 'main' },
  { icon: CreditCard, label: 'Passbook', href: '/passbook', category: 'main' }, // Added Passbook
  { icon: BarChart3, label: 'Analytics', href: '/analytics', category: 'insights' },
  { icon: TrendingUp, label: 'Reports', href: '/reports', category: 'insights' },
  { icon: Users, label: 'Groups', href: '/groups', category: 'social' },
  { icon: PiggyBank, label: 'Goals', href: '/goals', category: 'planning' }, // Changed icon for Goals
  { icon: Calendar, label: 'Recurring', href: '/recurring', category: 'planning' },
  { icon: User, label: 'Profile', href: '/profile', category: 'account' },
];

const categoryIcons = {
  main: Receipt,
  insights: BarChart3,
  social: Users,
  planning: Target, // Kept Target for planning section title
  account: User
};

const Sidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card">
      {/* Logo */}
      <div className="p-4 lg:p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
            <Wallet className="w-4 h-4 lg:w-6 lg:h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg lg:text-xl font-bold text-foreground">Expenza</h1>
            <p className="text-xs text-muted-foreground hidden lg:block">Smart Finance Tracker</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 lg:p-4 space-y-4 lg:space-y-6 overflow-y-auto">
        {/* Main Actions */}
        <div className="space-y-1 lg:space-y-2">
          <div className="flex items-center space-x-2 px-2 lg:px-3 mb-2 lg:mb-3">
            <categoryIcons.main className="w-3 h-3 lg:w-4 lg:h-4 text-muted-foreground" />
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
                  "flex items-center space-x-3 px-3 lg:px-4 py-2 lg:py-3 rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className={cn(
                  "w-4 h-4 lg:w-5 lg:h-5 transition-colors shrink-0",
                  isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                )} />
                <span className="font-medium text-sm lg:text-base">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Insights */}
        <div className="space-y-1 lg:space-y-2">
          <div className="flex items-center space-x-2 px-2 lg:px-3 mb-2 lg:mb-3">
            <categoryIcons.insights className="w-3 h-3 lg:w-4 lg:h-4 text-muted-foreground" />
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
                  "flex items-center space-x-3 px-3 lg:px-4 py-2 lg:py-3 rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className={cn(
                  "w-4 h-4 lg:w-5 lg:h-5 transition-colors shrink-0",
                  isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                )} />
                <span className="font-medium text-sm lg:text-base">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Social & Planning */}
        <div className="space-y-1 lg:space-y-2">
          <div className="flex items-center space-x-2 px-2 lg:px-3 mb-2 lg:mb-3">
            <categoryIcons.social className="w-3 h-3 lg:w-4 lg:h-4 text-muted-foreground" />
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
                  "flex items-center space-x-3 px-3 lg:px-4 py-2 lg:py-3 rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className={cn(
                  "w-4 h-4 lg:w-5 lg:h-5 transition-colors shrink-0",
                  isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                )} />
                <span className="font-medium text-sm lg:text-base">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="p-3 lg:p-4 border-t border-border space-y-1 lg:space-y-2">
        <Link
          to="/profile"
          onClick={() => setIsMobileOpen(false)}
          className={cn(
            "flex items-center space-x-3 px-3 lg:px-4 py-2 lg:py-3 rounded-xl transition-all duration-200 group",
            location.pathname === "/profile"
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <User className="w-4 h-4 lg:w-5 lg:h-5 shrink-0" />
          <span className="font-medium text-sm lg:text-base">Profile</span>
        </Link>
        {/* Example: Settings link, if you have a settings page */}
        {/* <Link
          to="/settings"
          onClick={() => setIsMobileOpen(false)}
          className={cn(
            "flex items-center space-x-3 px-3 lg:px-4 py-2 lg:py-3 rounded-xl transition-all duration-200 group",
            location.pathname === "/settings"
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Settings className="w-4 h-4 lg:w-5 lg:h-5 shrink-0" />
          <span className="font-medium text-sm lg:text-base">Settings</span>
        </Link> */}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2 rounded-lg bg-card border border-border shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Desktop sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 xl:w-72 border-r border-border shadow-sm">
        <SidebarContent />
      </div>

      {/* Mobile sidebar overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 sm:w-72 border-r border-border shadow-lg bg-card"> {/* Added bg-card here */}
            <div className="flex justify-end p-3">
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-2 rounded-lg hover:bg-muted"
              >
                <X className="w-4 h-4" />
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

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Plus, 
  BarChart3, 
  Users, 
  Target, 
  User, 
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
  { icon: CreditCard, label: 'Passbook', href: '/passbook', category: 'main' },
  { icon: BarChart3, label: 'Analytics', href: '/analytics', category: 'insights' },
  { icon: TrendingUp, label: 'Reports', href: '/reports', category: 'insights' },
  { icon: Users, label: 'Groups', href: '/groups', category: 'social' },
  { icon: PiggyBank, label: 'Goals', href: '/goals', category: 'planning' },
  { icon: Calendar, label: 'Recurring', href: '/recurring', category: 'planning' },
];

const categoryIcons = {
  main: Receipt,
  insights: BarChart3,
  social: Users,
  planning: Target,
};

interface SidebarContentInternalProps {
  showLogo?: boolean;
  onLinkClick: () => void; 
}

const SidebarContentInternal: React.FC<SidebarContentInternalProps> = ({ showLogo = true, onLinkClick }) => {
  const location = useLocation();

  return (
    <div className="flex flex-col flex-1">
      {showLogo && (
        <div className="p-4 lg:p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <Wallet className="w-4 h-4 lg:w-6 lg:h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg lg:text-xl font-bold text-foreground">DigiSamahārta</h1>
              <p className="text-xs text-muted-foreground hidden lg:block">Smart Finance Tracker</p>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 p-3 lg:p-4 space-y-4 lg:space-y-6 overflow-y-auto no-scrollbar">
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
                onClick={onLinkClick}
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
                onClick={onLinkClick}
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
                onClick={onLinkClick}
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
          onClick={onLinkClick}
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
      </div>
    </div>
  );
};

const Sidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const openMobileSidebar = () => {
    setIsMobileOpen(true);
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={openMobileSidebar}
        aria-label="Open sidebar"
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-md bg-card border border-border shadow-lg hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <Menu className="w-5 h-5 text-foreground" />
      </button>

      {/* Desktop sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 xl:w-72 border-r border-border shadow-sm bg-card">
        <SidebarContentInternal showLogo={true} onLinkClick={() => { /* No action needed for desktop links */ }} />
      </div>

      {/* Mobile sidebar overlay with animations */}
      <AnimatePresence>
        {isMobileOpen && (
          <div key="mobile-sidebar-wrapper" className="lg:hidden fixed inset-0 z-[60] flex" aria-modal="true">
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="absolute inset-0 bg-black/60"
              onClick={closeMobileSidebar}
            />
            
            {/* Sidebar Panel */}
            <motion.div
              key="sidebar-panel"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative z-10 h-full w-64 sm:w-72 bg-card border-r border-border shadow-xl flex flex-col"
            >
              {/* Mobile Sidebar Header with Close Button */}
              <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
                    <Wallet className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <h1 className="text-md font-bold text-foreground">DigiSamahārta</h1>
                </div>
                <button
                  onClick={closeMobileSidebar}
                  aria-label="Close sidebar"
                  className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Scrollable content area for mobile sidebar */}
              <div className="flex-1 overflow-y-auto">
                <SidebarContentInternal showLogo={false} onLinkClick={closeMobileSidebar} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;

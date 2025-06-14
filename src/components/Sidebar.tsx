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
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col flex-1 h-full">
      {showLogo && (
        <div className="flex-shrink-0 p-3 sm:p-4 md:p-5 lg:p-6 border-b border-border">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-primary-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-foreground truncate">
                DigiSamahārta
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block truncate">
                Smart Finance Tracker
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation with proper scrolling */}
      <nav className="flex-1 overflow-y-auto no-scrollbar p-2 sm:p-3 md:p-4 space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
        {/* Main Actions */}
        <div className="space-y-1 sm:space-y-1.5 md:space-y-2">
          <div className="flex items-center space-x-1.5 sm:space-x-2 px-1.5 sm:px-2 md:px-3 mb-1.5 sm:mb-2 md:mb-3">
            <categoryIcons.main className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-muted-foreground flex-shrink-0" />
            <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
              Main
            </span>
          </div>
          {sidebarItems.filter(item => item.category === 'main').map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onLinkClick}
                className={cn(
                  "flex items-center space-x-2 sm:space-x-2.5 md:space-x-3 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 rounded-lg sm:rounded-xl transition-all duration-200 group w-full",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className={cn(
                  "w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 transition-colors flex-shrink-0",
                  isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                )} />
                <span className="font-medium text-[11px] sm:text-xs md:text-sm truncate min-w-0 flex-1">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Insights */}
        <div className="space-y-1 sm:space-y-1.5 md:space-y-2">
          <div className="flex items-center space-x-1.5 sm:space-x-2 px-1.5 sm:px-2 md:px-3 mb-1.5 sm:mb-2 md:mb-3">
            <categoryIcons.insights className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-muted-foreground flex-shrink-0" />
            <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
              Insights
            </span>
          </div>
          {sidebarItems.filter(item => item.category === 'insights').map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onLinkClick}
                className={cn(
                  "flex items-center space-x-2 sm:space-x-2.5 md:space-x-3 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 rounded-lg sm:rounded-xl transition-all duration-200 group w-full",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className={cn(
                  "w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 transition-colors flex-shrink-0",
                  isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                )} />
                <span className="font-medium text-[11px] sm:text-xs md:text-sm truncate min-w-0 flex-1">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/*  Planning */}
        <div className="space-y-1 sm:space-y-1.5 md:space-y-2">
          <div className="flex items-center space-x-1.5 sm:space-x-2 px-1.5 sm:px-2 md:px-3 mb-1.5 sm:mb-2 md:mb-3">
            <categoryIcons.social className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-muted-foreground flex-shrink-0" />
            <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
              Social & Planning
            </span>
          </div>
          {sidebarItems.filter(item => ['social', 'planning'].includes(item.category)).map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onLinkClick}
                className={cn(
                  "flex items-center space-x-2 sm:space-x-2.5 md:space-x-3 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 rounded-lg sm:rounded-xl transition-all duration-200 group w-full",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className={cn(
                  "w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 transition-colors flex-shrink-0",
                  isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                )} />
                <span className="font-medium text-[11px] sm:text-xs md:text-sm truncate min-w-0 flex-1">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom section - Profile */}
      <div className="flex-shrink-0 p-2 sm:p-3 md:p-4 border-t border-border space-y-1 sm:space-y-1.5 md:space-y-2">
        <Link
          to="/profile"
          onClick={onLinkClick}
          className={cn(
            "flex items-center space-x-2 sm:space-x-2.5 md:space-x-3 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 rounded-lg sm:rounded-xl transition-all duration-200 group w-full",
            location.pathname === "/profile"
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <User className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 flex-shrink-0" />
          <span className="font-medium text-[11px] sm:text-xs md:text-sm truncate min-w-0 flex-1">
            Profile
          </span>
        </Link>
      </div>
    </div>
  );
};

const Sidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isMobile = useIsMobile();

  const openMobileSidebar = () => {
    setIsMobileOpen(true);
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile menu button - improved positioning and sizing */}
      <button
        onClick={openMobileSidebar}
        aria-label="Open sidebar"
        className="md:hidden fixed top-3 left-3 z-50 p-2 sm:p-2.5 rounded-lg bg-card border border-border shadow-lg hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
      </button>

      {/* Desktop sidebar - responsive widths */}
      <div className="hidden md:block fixed left-0 top-0 bottom-0 w-56 lg:w-64 xl:w-72 2xl:w-80 border-r border-border shadow-sm bg-card z-40">
        <SidebarContentInternal 
          showLogo={true} 
          onLinkClick={() => { /* No action needed for desktop links */ }} 
        />
      </div>

      {/* Mobile sidebar overlay with improved animations and sizing */}
      <AnimatePresence>
        {isMobileOpen && (
          <div 
            key="mobile-sidebar-wrapper" 
            className="md:hidden fixed inset-0 z-[60] flex overflow-hidden" 
            aria-modal="true"
          >
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={closeMobileSidebar}
            />
            
            {/* Sidebar Panel - responsive width */}
            <motion.div
              key="sidebar-panel"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative z-10 h-full w-72 sm:w-80 max-w-[85vw] bg-card border-r border-border shadow-xl flex flex-col"
            >
              {/* Mobile Sidebar Header with Close Button */}
              <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border flex-shrink-0">
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md flex-shrink-0">
                    <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
                  </div>
                  <h1 className="text-sm sm:text-base font-bold text-foreground truncate">
                    DigiSamahārta
                  </h1>
                </div>
                <button
                  onClick={closeMobileSidebar}
                  aria-label="Close sidebar"
                  className="p-1.5 sm:p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              
              {/* Scrollable content area for mobile sidebar */}
              <div className="flex-1 overflow-y-auto no-scrollbar">
                <SidebarContentInternal 
                  showLogo={false} 
                  onLinkClick={closeMobileSidebar} 
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;

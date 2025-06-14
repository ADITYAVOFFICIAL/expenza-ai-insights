import React, { useState, useEffect } from 'react';
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
  CreditCard,
  PiggyBank,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

// --- Main Navigation Structure ---
const navSections = [
  {
    title: 'Main',
    items: [
      { icon: Home, label: 'Dashboard', href: '/' },
      { icon: Plus, label: 'Add Expense', href: '/add-expense' },
      { icon: CreditCard, label: 'Passbook', href: '/passbook' },
    ],
  },
  {
    title: 'Analysis',
    items: [
      { icon: BarChart3, label: 'Analytics', href: '/analytics' },
      { icon: TrendingUp, label: 'Reports', href: '/reports' },
    ],
  },
  {
    title: 'Planning',
    items: [
      { icon: Users, label: 'Groups', href: '/groups' },
      { icon: PiggyBank, label: 'Goals', href: '/goals' },
      { icon: Calendar, label: 'Recurring', href: '/recurring' },
    ],
  },
];

// --- Reusable Sidebar Content ---
// This component renders the actual navigation links.
// It is now stateless regarding the open/closed state.
const SidebarContent = () => {
  const location = useLocation();

  return (
    <div className="flex h-full flex-col">
      {/* Logo Section */}
      <div className="flex h-16 shrink-0 items-center border-b border-border/70 px-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-md">
            <Wallet className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold tracking-tight text-foreground">
              DigiSamahārta
            </span>
          </div>
        </Link>
      </div>

      {/* Scrollable Navigation Area */}
      <nav className="flex-1 space-y-4 overflow-y-auto p-3">
        {navSections.map((section) => (
          <div key={section.title}>
            <h2 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {section.title}
            </h2>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      'group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'h-5 w-5 shrink-0',
                        isActive
                          ? 'text-primary-foreground'
                          : 'text-muted-foreground group-hover:text-foreground'
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Profile Link */}
      <div className="mt-auto flex-shrink-0 border-t border-border/70 p-3">
        <Link
          to="/profile"
          className={cn(
            'group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
            location.pathname === '/profile'
              ? 'bg-muted text-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <User className="h-5 w-5 shrink-0" />
          <span className="truncate">Profile</span>
        </Link>
      </div>
    </div>
  );
};

// --- Main Sidebar Component with State and Logic ---
const Sidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();

  // **BUG FIX**: This `useEffect` is the core of the fix.
  // It listens for any change in the URL (navigation) and
  // automatically closes the mobile sidebar.
  useEffect(() => {
    if (isMobile) {
      setIsMobileOpen(false);
    }
  }, [location.pathname, isMobile]);

  const openMobileSidebar = () => setIsMobileOpen(true);
  const closeMobileSidebar = () => setIsMobileOpen(false);

  return (
    <>
      {/* Mobile Hamburger Menu Button */}
      <button
        onClick={openMobileSidebar}
        aria-label="Open sidebar"
        className="fixed left-3 top-3 z-50 rounded-lg border bg-card p-2 shadow-lg transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary md:hidden"
      >
        <Menu className="h-5 w-5 text-foreground" />
      </button>

      {/* Desktop Sidebar (Static) */}
      <aside className="fixed left-0 top-0 hidden h-full w-56 flex-col border-r border-border/70 bg-card shadow-sm lg:w-64 xl:w-72 2xl:w-80 md:flex">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar (Animated Sheet) */}
      <AnimatePresence>
        {isMobileOpen && (
          <div
            className="fixed inset-0 z-[60] md:hidden"
            aria-modal="true"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={closeMobileSidebar}
            />

            {/* Sidebar Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative z-10 flex h-full w-72 max-w-[85vw] flex-col border-r border-border/70 bg-card shadow-xl"
            >
              {/* The close button is now part of the panel itself */}
              <button
                onClick={closeMobileSidebar}
                aria-label="Close sidebar"
                className="absolute right-3 top-3 z-20 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <X className="h-5 w-5" />
              </button>
              <SidebarContent />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
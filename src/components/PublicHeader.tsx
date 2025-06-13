// filepath: src/components/PublicHeader.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet } from 'lucide-react';

const PublicHeader: React.FC = () => {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
            <Wallet className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">DigiSamahārta</h1>
        </Link>
        <Link to="/login">
            <button className="px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-md">Sign In</button>
        </Link>
      </div>
    </header>
  );
};

export default PublicHeader;
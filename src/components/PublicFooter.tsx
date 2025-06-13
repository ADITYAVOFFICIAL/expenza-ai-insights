// filepath: src/components/PublicFooter.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const PublicFooter: React.FC = () => {
  return (
    <footer className="py-8 px-4 border-t border-border/60 bg-card">
      <div className="container mx-auto text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} DigiSamahārta. All rights reserved.</p>
        <div className="mt-3 space-x-4">
          <Link to="/privacy" className="hover:text-primary">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-primary">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
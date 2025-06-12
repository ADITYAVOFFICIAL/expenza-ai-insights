
import React from 'react';
import { Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-12 lg:h-14 xl:h-16 items-center justify-between px-3 lg:px-4">
        {/* Search */}
        <div className="flex-1 max-w-md ml-10 lg:ml-0">
          <div className="relative">
            <Search className="absolute left-2 lg:left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 lg:w-4 lg:h-4 text-muted-foreground" />
            <Input
              placeholder="Search expenses..."
              className="pl-8 lg:pl-10 bg-muted/50 border-0 focus-visible:ring-1 text-xs lg:text-sm h-8 lg:h-9"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-1 lg:space-x-2">
          {/* Quick Add Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="gap-1 lg:gap-2 h-8 lg:h-9 px-2 lg:px-3">
                <Plus className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="hidden sm:inline text-xs lg:text-sm">Add</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card">
              <DropdownMenuItem asChild>
                <Link to="/add-expense">Add Expense</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/groups">Create Group</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/goals">Add Goal</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-8 w-8 lg:h-9 lg:w-9">
                <Avatar className="w-6 h-6 lg:w-8 lg:h-8">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-xs lg:text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card">
              <DropdownMenuItem asChild>
                <Link to="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;

import { Plus, User, ArrowRight } from 'lucide-react'; // Removed Search
import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input'; // Input no longer needed
import { ThemeToggle } from '@/components/theme-toggle';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { storageService } from '@/lib/appwrite'; // Assuming storageService is used for profile image

const Header = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'U';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-end px-4 sm:px-6">
        {/* Search Area Removed */}

        {/* Actions Area */}
        {/* Adjusted spacing: space-x-1 sm:space-x-2 md:space-x-3 */}
        <div className="flex items-center space-x-2 md:space-x-3"> {/* Adjusted base space-x */}
          {/* Quick Add Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {/* Adjusted button padding for smallest screens when text is hidden */}
              <Button size="sm" className="h-9 gap-1.5 px-2 sm:px-3">
                <Plus className="h-4 w-4" />
                {/* Show "Add" text always */}
                <span className="text-xs sm:text-sm">Add</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link to="/add-expense" className="text-sm">Add Expense</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/groups" className="text-sm">Create Group</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/goals" className="text-sm">Set New Goal</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          {/* Added margin for gap */}
          <div className="ml-1 sm:ml-0"> {/* Add left margin for small screens, remove for sm+ as space-x handles it */}
            <ThemeToggle />
          </div>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                  {user?.avatarUrl ? (
                     <AvatarImage src={user.avatarUrl} alt={user.name || 'User'} />
                  ) : (
                    user?.prefs?.profileImageId && storageService ? ( // Fallback to prefs if direct avatarUrl is not available
                       <AvatarImage src={storageService.getFilePreview(user.prefs.profileImageId).toString()} alt={user.name || 'User'} />
                    ) : null
                  )}
                  <AvatarFallback className="text-xs sm:text-sm bg-gradient-to-br from-primary/70 to-accent/70 text-primary-foreground">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link to="/profile" className="text-sm">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-sm text-destructive focus:bg-destructive/10 focus:text-destructive">
                <ArrowRight className="mr-2 h-4 w-4 transform rotate-180" />
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

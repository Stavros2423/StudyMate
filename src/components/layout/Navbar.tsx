
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Bell, LogOut, User } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

const Navbar = () => {
  const { currentUser, logOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useNotifications();

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-background border-b border-border z-50">
      <div className="h-full flex items-center justify-between px-4">
        <Link to="/" className="text-xl font-bold text-primary">
          StudyMate
        </Link>

        {currentUser ? (
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </Button>
            
            <Link to="/inbox">
              <Button variant="outline" size="icon" className="relative">
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </Link>
            
            <Link to="/profile">
              <Button variant="outline" size="icon">
                <User size={18} />
              </Button>
            </Link>
            
            <Button variant="ghost" size="sm" onClick={logOut}>
              <LogOut size={18} className="mr-2" />
              Logout
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </Button>
            <Link to="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link to="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;


import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Home, BookOpen, Clock, User, Info, MessageSquare, BarChart } from "lucide-react";

interface SidebarProps {
  expanded: boolean;
}

const navItems = [
  { path: "/", label: "Home", icon: <Home className="h-5 w-5" /> },
  { path: "/feed", label: "Feed", icon: <BookOpen className="h-5 w-5" /> },
  { path: "/timer", label: "Pomodoro Timer", icon: <Clock className="h-5 w-5" /> },
  { path: "/about", label: "About", icon: <Info className="h-5 w-5" /> },
];

const Sidebar = ({ expanded }: SidebarProps) => {
  const { currentUser, userData } = useAuth();
  const location = useLocation();

  return (
    <div className="h-full bg-card rounded-lg p-2 border border-border shadow-md overflow-hidden">
      <nav className="flex flex-col space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors",
              location.pathname === item.path && "bg-accent font-medium",
              "sidebar-transition"
            )}
          >
            <span className="flex items-center justify-center">{item.icon}</span>
            <span className={`ml-2 whitespace-nowrap ${expanded ? 'opacity-100' : 'opacity-0 hidden'} sidebar-transition`}>
              {item.label}
            </span>
          </Link>
        ))}

        {currentUser && (
          <>
            <Link
              to="/dashboard"
              className={cn(
                "flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors",
                location.pathname === "/dashboard" && "bg-accent font-medium",
                "sidebar-transition"
              )}
            >
              <span className="flex items-center justify-center"><BarChart className="h-5 w-5" /></span>
              <span className={`ml-2 whitespace-nowrap ${expanded ? 'opacity-100' : 'opacity-0 hidden'} sidebar-transition`}>
                Dashboard
              </span>
            </Link>

            <Link
              to="/profile"
              className={cn(
                "flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors",
                location.pathname === "/profile" && "bg-accent font-medium",
                "sidebar-transition"
              )}
            >
              <span className="flex items-center justify-center"><User className="h-5 w-5" /></span>
              <span className={`ml-2 whitespace-nowrap ${expanded ? 'opacity-100' : 'opacity-0 hidden'} sidebar-transition`}>
                Profile
              </span>
            </Link>
          </>
        )}
      </nav>

      {currentUser && userData && expanded && (
        <div className="mt-4 p-3 border rounded-lg bg-card/30 backdrop-blur-sm">
          <div className="font-medium">{userData.displayName}</div>
          <div className="text-sm text-muted-foreground">@{userData.username}</div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;

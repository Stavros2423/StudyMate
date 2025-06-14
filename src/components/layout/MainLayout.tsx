
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const MainLayout = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  useEffect(() => {
    document.title = "StudyMate";
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.classList.add('opacity-0');
      setTimeout(() => {
        mainContent.classList.remove('opacity-0');
        mainContent.classList.add('animate-fade-in');
      }, 50);
    }
  }, [location.pathname]);

  const handleMouseEnter = () => {
    setSidebarExpanded(true);
  };

  const handleMouseLeave = () => {
    setSidebarExpanded(false);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">

        <div
          className="sidebar-hover-area"
          onMouseEnter={handleMouseEnter}
        />

        <div
          className={`${sidebarExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'} fixed top-14 h-[calc(100vh-3.5rem)] hidden md:block sidebar-transition z-40`}
          onMouseLeave={handleMouseLeave}
        >
          <Sidebar expanded={sidebarExpanded} />
        </div>

        <div className={`flex-1 overflow-auto ml-0 md:ml-16 transition-all duration-300 ${sidebarExpanded ? 'md:ml-60' : 'md:ml-16'}`}>
          <div className="h-full p-4">
            <main className="h-full">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;

import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutGrid, Network, Thermometer, Battery, Shield, 
  Menu, X, ChevronRight, Home, Settings
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar for larger screens */}
      <aside className={`bg-slate-800 text-white fixed inset-y-0 left-0 z-20 w-64 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="flex items-center justify-between px-4 py-6 border-b border-slate-700">
          <div className="flex items-center space-x-2">
            <Network className="w-8 h-8 text-blue-400" />
            <span className="text-xl font-semibold">Nuist Smart Home</span>
          </div>
          <button onClick={toggleSidebar} className="p-1 rounded-md md:hidden hover:bg-slate-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="px-4 py-4">
          <ul className="space-y-1">
            <li>
              <NavLink to="/Smart-Home-WSN/" className={({ isActive }) => 
                `flex items-center px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700'}`
              }>
                <LayoutGrid className="w-5 h-5 mr-3" />
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/Smart-Home-WSN/network/" className={({ isActive }) => 
                `flex items-center px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700'}`
              }>
                <Network className="w-5 h-5 mr-3" />
                Network Simulation
              </NavLink>
            </li>
            <li>
              <NavLink to="/Smart-Home-WSN/sensors/" className={({ isActive }) => 
                `flex items-center px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700'}`
              }>
                <Thermometer className="w-5 h-5 mr-3" />
                Sensor Data
              </NavLink>
            </li>
            <li>
              <NavLink to="/Smart-Home-WSN/energy/" className={({ isActive }) => 
                `flex items-center px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700'}`
              }>
                <Battery className="w-5 h-5 mr-3" />
                Energy Analysis
              </NavLink>
            </li>
            <li>
              <NavLink to="/Smart-Home-WSN/security/" className={({ isActive }) => 
                `flex items-center px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700'}`
              }>
                <Shield className="w-5 h-5 mr-3" />
                Security
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Mobile menu button */}
      <div className="fixed left-0 z-20 p-4 md:hidden">
        <button onClick={toggleSidebar} className="p-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-x-hidden md:ml-64">
        <main className="w-full min-h-screen p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
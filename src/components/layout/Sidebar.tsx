import React from 'react';

import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Box, 
  LogOut,
  Upload, // Remplace Import
  Download, // Remplace Export
  Users, 
  Settings, 
  Anchor, 
  Tag, 
  Building, 
  ChevronDown, 
  ChevronRight 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

interface SubMenuProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const NavItem = ({ to, icon, label, onClick }: NavItemProps) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center px-4 py-3 text-gray-600 transition-colors duration-200 ${
        isActive ? 'bg-blue-100 text-blue-900 font-medium' : 'hover:bg-gray-100'
      } rounded-lg`
    }
    onClick={onClick}
  >
    <span className="text-lg">{icon}</span>
    <span className="ml-4 text-sm">{label}</span>
  </NavLink>
);

const SubMenu = ({ title, icon, children }: SubMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center w-full px-4 py-3 text-gray-600 transition-colors duration-200 hover:bg-gray-100 rounded-lg"
      >
        <span className="text-lg">{icon}</span>
        <span className="ml-4 text-sm">{title}</span>
        <span className="ml-auto">
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
      </button>
      {isOpen && <div className="pl-10 mt-1">{children}</div>}
    </div>
  );
};

const Sidebar = ({ isOpen, toggleSidebar }: SidebarProps) => {
  const { logout, isAdmin } = useAuth();

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b">
            <Box className="w-8 h-8 text-blue-900" />
            <h1 className="ml-2 text-xl font-bold text-blue-900">GESTCONT</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Tableau de bord" onClick={() => toggleSidebar()} />
            
            <SubMenu title="Conteneurs" icon={<Box size={20} />}>
              <NavItem to="/container-entry" icon={<Upload size={18} />} label="Entrée conteneur" onClick={() => toggleSidebar()} />
              <NavItem to="/container-exit" icon={<Download size={18} />} label="Sortie conteneur" onClick={() => toggleSidebar()} />
              <NavItem to="/containers" icon={<Box size={18} />} label="Liste conteneurs" onClick={() => toggleSidebar()} />
            </SubMenu>
            
            <SubMenu title="Clients" icon={<Building size={20} />}>
              <NavItem to="/client-container-entry" icon={<Upload size={18} />} label="Entrée conteneur" onClick={() => toggleSidebar()} />
              <NavItem to="/client-container-exit" icon={<Download size={18} />} label="Sortie conteneur" onClick={() => toggleSidebar()} />
            </SubMenu>
            
            {isAdmin && (
              <SubMenu title="Administration" icon={<Settings size={20} />}>
                <NavItem to="/admin/users" icon={<Users size={18} />} label="Utilisateurs" onClick={() => toggleSidebar()} />
                <NavItem to="/admin/shipping-lines" icon={<Anchor size={18} />} label="Armateurs" onClick={() => toggleSidebar()} />
                <NavItem to="/admin/iso-codes" icon={<Tag size={18} />} label="Codes ISO" onClick={() => toggleSidebar()} />
              </SubMenu>
            )}
          </nav>

          {/* Logout */}
          <div className="px-2 py-4 border-t">
            <button
              onClick={logout}
              className="flex items-center w-full px-4 py-3 text-gray-600 transition-colors duration-200 hover:bg-gray-100 rounded-lg"
            >
              <LogOut size={20} />
              <span className="ml-4 text-sm">Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
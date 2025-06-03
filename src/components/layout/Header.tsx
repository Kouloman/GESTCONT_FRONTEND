import React from 'react';

import { useAuth } from '../../contexts/AuthContext';
import { Bell, Menu, User } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  const { user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="z-10 py-4 bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="p-1 mr-3 rounded-md lg:hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Menu size={24} />
          </button>
          <h2 className="text-xl font-semibold text-gray-800">GESTCONT</h2>
        </div>

        <div className="flex items-center space-x-4">
          <button className="relative p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
            >
              <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center text-white">
                <User size={16} />
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700">
                {user?.username}
              </span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 animate-fadeIn">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setDropdownOpen(false)}
                >
                  Profil
                </Link>
                <Link
                  to="/settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setDropdownOpen(false)}
                >
                  Paramètres
                </Link>
                <hr className="my-1" />
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    // Add logout functionality here
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
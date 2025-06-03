import React from 'react';

const Footer = () => {
  return (
    <footer className="py-3 px-6 bg-white border-t text-center">
      <p className="text-sm text-gray-600">
        &copy; {new Date().getFullYear()} GESTCONT - Système de gestion de conteneurs
      </p>
    </footer>
  );
};

export default Footer;
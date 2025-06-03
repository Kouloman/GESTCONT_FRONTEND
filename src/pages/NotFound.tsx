import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
          <div className="h-24 w-24 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-5xl font-bold text-red-600">404</span>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-3">Page non trouvée</h1>
        <p className="text-gray-600 mb-6">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <Link
            to="/"
            className="btn btn-primary flex items-center justify-center"
          >
            <Home size={18} className="mr-2" />
            Retour à l'accueil
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn btn-outline flex items-center justify-center"
          >
            <ArrowLeft size={18} className="mr-2" />
            Page précédente
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
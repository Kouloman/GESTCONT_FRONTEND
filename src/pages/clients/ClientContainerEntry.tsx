import React from 'react';
import ClientContainerEntryForm from '../../components/forms/ClientContainerEntryForm';

const ClientContainerEntry = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Entrée de conteneur par client</h1>
        <p className="text-gray-600">Enregistrez les conteneurs entrant dans le parc par client</p>
      </div>
      
      <ClientContainerEntryForm />
    </div>
  );
};

export default ClientContainerEntry;
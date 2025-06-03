import React from 'react';
import ClientContainerExitForm from '../../components/forms/ClientContainerExitForm';

const ClientContainerExit = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Sortie de conteneur par client</h1>
        <p className="text-gray-600">Enregistrez les conteneurs sortant du parc par client</p>
      </div>
      
      <ClientContainerExitForm />
    </div>
  );
};

export default ClientContainerExit;
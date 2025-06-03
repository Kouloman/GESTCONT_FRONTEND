import React from 'react';
import ContainerEntryForm from '../../components/forms/ContainerEntryForm';

const ContainerEntry = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Entrée de conteneur</h1>
        <p className="text-gray-600">Enregistrez les conteneurs entrant dans le parc par armateur</p>
      </div>
      
      <ContainerEntryForm />
    </div>
  );
};

export default ContainerEntry;
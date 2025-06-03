import React from 'react';
import ContainerExitForm from '../../components/forms/ContainerExitForm';

const ContainerExit = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Sortie de conteneur</h1>
        <p className="text-gray-600">Enregistrez les conteneurs sortant du parc par armateur</p>
      </div>
      
      <ContainerExitForm />
    </div>
  );
};

export default ContainerExit;
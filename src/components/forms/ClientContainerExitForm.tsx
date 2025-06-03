import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { Search, Check } from 'lucide-react';
import api from '../../services/api';
import { mockContainerService } from '../../services/mockServices';
import LoadingSpinner from '../ui/LoadingSpinner';

// Search validation schema
const SearchSchema = Yup.object().shape({
  containerNumber: Yup.string()
    .matches(/^[A-Z]{3}U\d{7}$/, "Format invalide. Ex: MSCU1234567")
    .required("Le numéro de conteneur est requis"),
});

// Exit form validation schema
const ExitFormSchema = Yup.object().shape({
  exitDate: Yup.date()
    .max(new Date(), "La date ne peut pas être dans le futur")
    .required("La date de sortie est requise"),
  comments: Yup.string(),
});

const ClientContainerExitForm = () => {
  const [container, setContainer] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSearch = async (values) => {
    setIsSearching(true);
    
    try {
      // Try API first
      try {
        const response = await api.get(`/containers/client/number/${values.containerNumber}`);
        const containerData = response.data;
        
        if (containerData.status !== 'IN_PARK') {
          toast.error("Ce conteneur n'est pas dans le parc");
          setContainer(null);
          return;
        }
        
        setContainer(containerData);
      } catch (error) {
        // Fall back to mock service in development
        if (import.meta.env.DEV) {
          const containerData = await mockContainerService.getByContainerNumber(values.containerNumber);
          
          if (!containerData) {
            toast.error("Conteneur non trouvé");
            setContainer(null);
            return;
          }
          
          if (containerData.status !== 'IN_PARK' || !containerData.client) {
            toast.error("Ce conteneur n'est pas dans le parc ou n'appartient pas à un client");
            setContainer(null);
            return;
          }
          
          setContainer(containerData);
        } else {
          throw error;
        }
      }
    } catch (error) {
      toast.error("Erreur lors de la recherche du conteneur");
      setContainer(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    
    try {
      // Format the date properly
      const formattedValues = {
        ...values,
        exitDate: new Date(values.exitDate).toISOString(),
      };
      
      // Try API first
      try {
        await api.post(`/containers/client/${container.id}/exit`, formattedValues);
      } catch (error) {
        // Fall back to mock service in development
        if (import.meta.env.DEV && error.isMockable) {
          await mockContainerService.exitContainerClient(container.containerNumber, formattedValues);
        } else {
          throw error;
        }
      }
      
      toast.success("Sortie de conteneur enregistrée avec succès");
      setSuccess(true);
      setContainer(null);
      
      // Reset success state after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement de la sortie");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 animate-fadeIn">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Enregistrement de sortie de conteneur client</h2>
      
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md text-green-800 flex items-center">
          <Check size={20} className="mr-2" />
          <span>Sortie de conteneur enregistrée avec succès!</span>
        </div>
      )}
      
      {/* Container Search Form */}
      <div className={`mb-6 ${container ? 'opacity-50' : ''}`}>
        <h3 className="text-md font-medium text-gray-700 mb-3">Rechercher un conteneur client</h3>
        <Formik
          initialValues={{
            containerNumber: '',
          }}
          validationSchema={SearchSchema}
          onSubmit={handleSearch}
          validateOnChange={false}
        >
          {({ isSubmitting: formikSearching }) => (
            <Form>
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-grow">
                  <Field
                    type="text"
                    id="containerNumber"
                    name="containerNumber"
                    placeholder="Numéro de conteneur (ex: MSCU1234567)"
                    className="form-input uppercase"
                    disabled={!!container}
                  />
                  <ErrorMessage name="containerNumber" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                <button
                  type="submit"
                  disabled={isSearching || formikSearching || !!container}
                  className="btn btn-primary flex items-center justify-center min-w-[120px]"
                >
                  {isSearching ? <LoadingSpinner size="small" /> : (
                    <>
                      <Search size={16} className="mr-2" />
                      Rechercher
                    </>
                  )}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
      
      {/* Container Details and Exit Form */}
      {container && (
        <div className="space-y-6 animate-fadeIn">
          {/* Container Details */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-md font-medium text-gray-700 mb-3">Détails du conteneur</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Numéro de conteneur</p>
                <p className="font-medium">{container.containerNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Client</p>
                <p className="font-medium">{container.client}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Code ISO</p>
                <p className="font-medium">{container.isoCode}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="font-medium">{container.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date d'entrée</p>
                <p className="font-medium">
                  {new Date(container.entryDate).toLocaleDateString('fr-FR')}
                </p>
              </div>
              {container.damages && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Avaries</p>
                  <p className="font-medium">{container.damages}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Exit Form */}
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-3">Informations de sortie</h3>
            <Formik
              initialValues={{
                exitDate: new Date().toISOString().split('T')[0],
                comments: '',
              }}
              validationSchema={ExitFormSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting: formikSubmitting }) => (
                <Form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Exit Date */}
                    <div>
                      <label htmlFor="exitDate" className="form-label">Date de sortie</label>
                      <Field
                        type="date"
                        id="exitDate"
                        name="exitDate"
                        className="form-input"
                      />
                      <ErrorMessage name="exitDate" component="div" className="text-red-500 text-xs mt-1" />
                    </div>
                    
                    {/* Comments */}
                    <div className="md:col-span-2">
                      <label htmlFor="comments" className="form-label">Commentaires</label>
                      <Field
                        as="textarea"
                        id="comments"
                        name="comments"
                        rows={2}
                        className="form-input"
                      />
                      <ErrorMessage name="comments" component="div" className="text-red-500 text-xs mt-1" />
                    </div>
                  </div>
                  
                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setContainer(null)}
                      className="btn btn-outline"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || formikSubmitting}
                      className="btn btn-primary flex items-center justify-center min-w-[120px]"
                    >
                      {isSubmitting ? <LoadingSpinner size="small" /> : 'Enregistrer la sortie'}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientContainerExitForm;
import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { mockClientService, mockIsoCodeService, mockContainerService } from '../../services/mockServices';
import LoadingSpinner from '../ui/LoadingSpinner';
import { Check } from 'lucide-react';

// Form validation schema
const ClientContainerEntrySchema = Yup.object().shape({
  entryDate: Yup.date()
    .max(new Date(), "La date ne peut pas être dans le futur")
    .required("La date d'entrée est requise"),
  clientId: Yup.string()
    .required("Le client est requis"),
  containerNumber: Yup.string()
    .matches(/^[A-Z]{3}U\d{7}$/, "Format invalide. Ex: MSCU1234567")
    .required("Le numéro de conteneur est requis"),
  isoCodeId: Yup.string()
    .required("Le code ISO est requis"),
  type: Yup.string()
    .oneOf(['DRY', 'REEFER'], "Type invalide")
    .required("Le type de conteneur est requis"),
  damages: Yup.string(),
  transporter: Yup.string()
    .required("Le transporteur est requis"),
  truckRef: Yup.string()
    .required("La référence du camion est requise"),
  comments: Yup.string(),
});

const ClientContainerEntryForm = () => {
  const [clients, setClients] = useState([]);
  const [isoCodes, setIsoCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Try to fetch from API
        const [clientsResponse, isoCodesResponse] = await Promise.all([
          api.get('/clients'),
          api.get('/iso-codes')
        ]);
        
        setClients(clientsResponse.data);
        setIsoCodes(isoCodesResponse.data);
      } catch (error) {
        // Fallback to mock data in development
        if (import.meta.env.DEV) {
          try {
            const [mockClients, mockIsoCodes] = await Promise.all([
              mockClientService.getAll(),
              mockIsoCodeService.getAll()
            ]);
            
            setClients(mockClients);
            setIsoCodes(mockIsoCodes);
          } catch (mockError) {
            toast.error("Erreur lors du chargement des données");
          }
        } else {
          toast.error("Erreur lors du chargement des données");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (values, { resetForm }) => {
    setIsSubmitting(true);
    
    try {
      // Format the date properly
      const formattedValues = {
        ...values,
        entryDate: new Date(values.entryDate).toISOString(),
        client: clients.find(c => c.id === values.clientId)?.name || values.clientId,
        source: 'CLIENT'
      };
      
      // Get client name for display purposes
      const client = clients.find(c => c.id === values.clientId);
      const isoCode = isoCodes.find(iso => iso.id === values.isoCodeId);
      
      if (client) {
        formattedValues.clientName = client.name;
      }
      
      if (isoCode) {
        formattedValues.isoCode = isoCode.code;
      }
      
      // Try API first
      try {
        await api.post('/containers/client', formattedValues);
      } catch (error) {
        // Fall back to mock service in development
        if (import.meta.env.DEV && error.isMockable) {
          await mockContainerService.create(formattedValues);
        } else {
          throw error;
        }
      }
      
      toast.success("Conteneur enregistré avec succès");
      setSuccess(true);
      resetForm();
      
      // Reset success state after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement du conteneur");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 animate-fadeIn">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Enregistrement d'entrée de conteneur par client</h2>
      
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md text-green-800 flex items-center">
          <Check size={20} className="mr-2" />
          <span>Conteneur enregistré avec succès!</span>
        </div>
      )}
      
      <Formik
        initialValues={{
          entryDate: new Date().toISOString().split('T')[0],
          clientId: '',
          containerNumber: '',
          isoCodeId: '',
          type: '',
          damages: '',
          transporter: '',
          truckRef: '',
          comments: '',
        }}
        validationSchema={ClientContainerEntrySchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting: formikSubmitting }) => (
          <Form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Entry Date */}
              <div>
                <label htmlFor="entryDate" className="form-label">Date d'entrée</label>
                <Field
                  type="date"
                  id="entryDate"
                  name="entryDate"
                  className="form-input"
                />
                <ErrorMessage name="entryDate" component="div" className="text-red-500 text-xs mt-1" />
              </div>
              
              {/* Client */}
              <div>
                <label htmlFor="clientId" className="form-label">Client</label>
                <Field
                  as="select"
                  id="clientId"
                  name="clientId"
                  className="form-select"
                >
                  <option value="">Sélectionner un client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </Field>
                <ErrorMessage name="clientId" component="div" className="text-red-500 text-xs mt-1" />
              </div>
              
              {/* Container Number */}
              <div>
                <label htmlFor="containerNumber" className="form-label">Numéro de conteneur</label>
                <Field
                  type="text"
                  id="containerNumber"
                  name="containerNumber"
                  placeholder="Ex: MSCU1234567"
                  className="form-input uppercase"
                />
                <ErrorMessage name="containerNumber" component="div" className="text-red-500 text-xs mt-1" />
              </div>
              
              {/* ISO Code */}
              <div>
                <label htmlFor="isoCodeId" className="form-label">Code ISO</label>
                <Field
                  as="select"
                  id="isoCodeId"
                  name="isoCodeId"
                  className="form-select"
                >
                  <option value="">Sélectionner un code ISO</option>
                  {isoCodes.map(iso => (
                    <option key={iso.id} value={iso.id}>{iso.code} - {iso.description}</option>
                  ))}
                </Field>
                <ErrorMessage name="isoCodeId" component="div" className="text-red-500 text-xs mt-1" />
              </div>
              
              {/* Container Type */}
              <div>
                <label htmlFor="type" className="form-label">Type de conteneur</label>
                <Field
                  as="select"
                  id="type"
                  name="type"
                  className="form-select"
                >
                  <option value="">Sélectionner un type</option>
                  <option value="DRY">DRY</option>
                  <option value="REEFER">REEFER</option>
                </Field>
                <ErrorMessage name="type" component="div" className="text-red-500 text-xs mt-1" />
              </div>
              
              {/* Transporter */}
              <div>
                <label htmlFor="transporter" className="form-label">Transporteur</label>
                <Field
                  type="text"
                  id="transporter"
                  name="transporter"
                  className="form-input"
                />
                <ErrorMessage name="transporter" component="div" className="text-red-500 text-xs mt-1" />
              </div>
              
              {/* Truck Reference */}
              <div>
                <label htmlFor="truckRef" className="form-label">Référence du camion</label>
                <Field
                  type="text"
                  id="truckRef"
                  name="truckRef"
                  className="form-input"
                />
                <ErrorMessage name="truckRef" component="div" className="text-red-500 text-xs mt-1" />
              </div>
              
              {/* Damages */}
              <div className="md:col-span-2">
                <label htmlFor="damages" className="form-label">Avaries</label>
                <Field
                  as="textarea"
                  id="damages"
                  name="damages"
                  rows={2}
                  className="form-input"
                />
                <ErrorMessage name="damages" component="div" className="text-red-500 text-xs mt-1" />
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
            
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSubmitting || formikSubmitting}
                className="btn btn-primary flex items-center justify-center min-w-[120px]"
              >
                {isSubmitting ? <LoadingSpinner size="small" /> : 'Enregistrer'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ClientContainerEntryForm;
import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash2, Check, X } from 'lucide-react';
import api from '../../services/api';
import { mockIsoCodeService } from '../../services/mockServices';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

// Validation schema
const IsoCodeSchema = Yup.object().shape({
  code: Yup.string()
    .matches(/^[0-9]{2}[A-Z][0-9]$/, 'Format invalide. Ex: 22G1')
    .required('Le code est requis'),
  description: Yup.string()
    .required('La description est requise'),
  active: Yup.boolean(),
});

const IsoManagement = () => {
  const [isoCodes, setIsoCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIsoCode, setEditingIsoCode] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchIsoCodes();
  }, []);

  const fetchIsoCodes = async () => {
    setLoading(true);
    
    try {
      // Try API first
      try {
        const response = await api.get('/iso-codes');
        setIsoCodes(response.data);
      } catch (error) {
        // Fall back to mock service in development
        if (import.meta.env.DEV) {
          const mockIsoCodes = await mockIsoCodeService.getAll();
          setIsoCodes(mockIsoCodes);
        } else {
          throw error;
        }
      }
    } catch (error) {
      toast.error("Erreur lors du chargement des codes ISO");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIsoCode = () => {
    setEditingIsoCode(null);
    setIsFormOpen(true);
  };

  const handleEditIsoCode = (isoCode) => {
    setEditingIsoCode(isoCode);
    setIsFormOpen(true);
  };

  const handleDeleteIsoCode = async (id) => {
    try {
      // Try API first
      try {
        await api.delete(`/iso-codes/${id}`);
      } catch (error) {
        // Fall back to mock service in development
        if (import.meta.env.DEV && error.isMockable) {
          await mockIsoCodeService.delete(id);
        } else {
          throw error;
        }
      }
      
      toast.success("Code ISO supprimé avec succès");
      setIsoCodes(isoCodes.filter(iso => iso.id !== id));
    } catch (error) {
      toast.error("Erreur lors de la suppression du code ISO");
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  const handleSubmit = async (values, { resetForm }) => {
    setIsSubmitting(true);
    
    try {
      // Ensure code is uppercase
      values.code = values.code.toUpperCase();
      
      if (editingIsoCode) {
        // Update existing ISO code
        try {
          const response = await api.put(`/iso-codes/${editingIsoCode.id}`, values);
          setIsoCodes(isoCodes.map(iso => iso.id === editingIsoCode.id ? response.data : iso));
        } catch (error) {
          // Fall back to mock service in development
          if (import.meta.env.DEV && error.isMockable) {
            const updatedIsoCode = await mockIsoCodeService.update(editingIsoCode.id, values);
            setIsoCodes(isoCodes.map(iso => iso.id === editingIsoCode.id ? updatedIsoCode : iso));
          } else {
            throw error;
          }
        }
        
        toast.success("Code ISO mis à jour avec succès");
      } else {
        // Create new ISO code
        try {
          const response = await api.post('/iso-codes', values);
          setIsoCodes([...isoCodes, response.data]);
        } catch (error) {
          // Fall back to mock service in development
          if (import.meta.env.DEV && error.isMockable) {
            const newIsoCode = await mockIsoCodeService.create(values);
            setIsoCodes([...isoCodes, newIsoCode]);
          } else {
            throw error;
          }
        }
        
        toast.success("Code ISO créé avec succès");
      }
      
      setIsFormOpen(false);
      setEditingIsoCode(null);
      resetForm();
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement du code ISO");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des codes ISO</h1>
          <p className="text-gray-600">Créez et gérez les codes ISO des conteneurs</p>
        </div>
        
        <button
          onClick={handleCreateIsoCode}
          className="btn btn-primary flex items-center"
        >
          <Plus size={18} className="mr-2" />
          Nouveau code ISO
        </button>
      </div>
      
      {/* ISO Code Form */}
      {isFormOpen && (
        <div className="bg-white rounded-lg shadow-sm p-6 animate-fadeIn">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            {editingIsoCode ? 'Modifier le code ISO' : 'Nouveau code ISO'}
          </h2>
          
          <Formik
            initialValues={{
              code: editingIsoCode?.code || '',
              description: editingIsoCode?.description || '',
              active: editingIsoCode?.active ?? true,
            }}
            validationSchema={IsoCodeSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting: formikSubmitting }) => (
              <Form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Code */}
                  <div>
                    <label htmlFor="code" className="form-label">Code ISO</label>
                    <Field
                      type="text"
                      id="code"
                      name="code"
                      className="form-input uppercase"
                      placeholder="Ex: 22G1"
                    />
                    <ErrorMessage name="code" component="div" className="text-red-500 text-xs mt-1" />
                  </div>
                  
                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="form-label">Description</label>
                    <Field
                      type="text"
                      id="description"
                      name="description"
                      className="form-input"
                      placeholder="Ex: 20' General Purpose"
                    />
                    <ErrorMessage name="description" component="div" className="text-red-500 text-xs mt-1" />
                  </div>
                  
                  {/* Active */}
                  <div className="flex items-center">
                    <Field
                      type="checkbox"
                      id="active"
                      name="active"
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="active" className="ml-2 text-sm text-gray-700">
                      Actif
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false);
                      setEditingIsoCode(null);
                    }}
                    className="btn btn-outline"
                  >
                    Annuler
                  </button>
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
      )}
      
      {/* ISO Codes List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden animate-fadeIn">
        {loading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isoCodes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    Aucun code ISO trouvé
                  </td>
                </tr>
              ) : (
                isoCodes.map((isoCode) => (
                  <tr key={isoCode.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{isoCode.code}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{isoCode.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        isoCode.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {isoCode.active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {showDeleteConfirm === isoCode.id ? (
                        <div className="flex items-center justify-end space-x-2">
                          <span className="text-sm text-gray-600 mr-2">Confirmer?</span>
                          <button
                            onClick={() => handleDeleteIsoCode(isoCode.id)}
                            className="text-red-600 hover:text-red-900 p-1"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(null)}
                            className="text-gray-600 hover:text-gray-900 p-1"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEditIsoCode(isoCode)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(isoCode.id)}
                            className="text-red-600 hover:text-red-900 p-1"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default IsoManagement;
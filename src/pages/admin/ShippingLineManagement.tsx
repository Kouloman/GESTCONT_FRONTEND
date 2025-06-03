import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash2, Check, X } from 'lucide-react';
import api from '../../services/api';
import { mockShippingLineService } from '../../services/mockServices';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

// Validation schema
const ShippingLineSchema = Yup.object().shape({
  name: Yup.string()
    .required('Le nom est requis'),
  code: Yup.string()
    .max(3, 'Le code doit contenir 3 caractères maximum')
    .matches(/^[A-Z]+$/, 'Le code doit être en majuscules')
    .required('Le code est requis'),
  active: Yup.boolean(),
});

const ShippingLineManagement = () => {
  const [shippingLines, setShippingLines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingShippingLine, setEditingShippingLine] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchShippingLines();
  }, []);

  const fetchShippingLines = async () => {
    setLoading(true);
    
    try {
      // Try API first
      try {
        const response = await api.get('/shipping-lines');
        setShippingLines(response.data);
      } catch (error) {
        // Fall back to mock service in development
        if (import.meta.env.DEV) {
          const mockShippingLines = await mockShippingLineService.getAll();
          setShippingLines(mockShippingLines);
        } else {
          throw error;
        }
      }
    } catch (error) {
      toast.error("Erreur lors du chargement des armateurs");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShippingLine = () => {
    setEditingShippingLine(null);
    setIsFormOpen(true);
  };

  const handleEditShippingLine = (shippingLine) => {
    setEditingShippingLine(shippingLine);
    setIsFormOpen(true);
  };

  const handleDeleteShippingLine = async (id) => {
    try {
      // Try API first
      try {
        await api.delete(`/shipping-lines/${id}`);
      } catch (error) {
        // Fall back to mock service in development
        if (import.meta.env.DEV && error.isMockable) {
          await mockShippingLineService.delete(id);
        } else {
          throw error;
        }
      }
      
      toast.success("Armateur supprimé avec succès");
      setShippingLines(shippingLines.filter(sl => sl.id !== id));
    } catch (error) {
      toast.error("Erreur lors de la suppression de l'armateur");
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  const handleSubmit = async (values, { resetForm }) => {
    setIsSubmitting(true);
    
    try {
      // Ensure code is uppercase
      values.code = values.code.toUpperCase();
      
      if (editingShippingLine) {
        // Update existing shipping line
        try {
          const response = await api.put(`/shipping-lines/${editingShippingLine.id}`, values);
          setShippingLines(shippingLines.map(sl => sl.id === editingShippingLine.id ? response.data : sl));
        } catch (error) {
          // Fall back to mock service in development
          if (import.meta.env.DEV && error.isMockable) {
            const updatedShippingLine = await mockShippingLineService.update(editingShippingLine.id, values);
            setShippingLines(shippingLines.map(sl => sl.id === editingShippingLine.id ? updatedShippingLine : sl));
          } else {
            throw error;
          }
        }
        
        toast.success("Armateur mis à jour avec succès");
      } else {
        // Create new shipping line
        try {
          const response = await api.post('/shipping-lines', values);
          setShippingLines([...shippingLines, response.data]);
        } catch (error) {
          // Fall back to mock service in development
          if (import.meta.env.DEV && error.isMockable) {
            const newShippingLine = await mockShippingLineService.create(values);
            setShippingLines([...shippingLines, newShippingLine]);
          } else {
            throw error;
          }
        }
        
        toast.success("Armateur créé avec succès");
      }
      
      setIsFormOpen(false);
      setEditingShippingLine(null);
      resetForm();
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement de l'armateur");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des armateurs</h1>
          <p className="text-gray-600">Créez et gérez les armateurs de conteneurs</p>
        </div>
        
        <button
          onClick={handleCreateShippingLine}
          className="btn btn-primary flex items-center"
        >
          <Plus size={18} className="mr-2" />
          Nouvel armateur
        </button>
      </div>
      
      {/* Shipping Line Form */}
      {isFormOpen && (
        <div className="bg-white rounded-lg shadow-sm p-6 animate-fadeIn">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            {editingShippingLine ? 'Modifier l\'armateur' : 'Nouvel armateur'}
          </h2>
          
          <Formik
            initialValues={{
              name: editingShippingLine?.name || '',
              code: editingShippingLine?.code || '',
              active: editingShippingLine?.active ?? true,
            }}
            validationSchema={ShippingLineSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting: formikSubmitting }) => (
              <Form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="form-label">Nom de l'armateur</label>
                    <Field
                      type="text"
                      id="name"
                      name="name"
                      className="form-input"
                    />
                    <ErrorMessage name="name" component="div" className="text-red-500 text-xs mt-1" />
                  </div>
                  
                  {/* Code */}
                  <div>
                    <label htmlFor="code" className="form-label">Code (3 lettres max)</label>
                    <Field
                      type="text"
                      id="code"
                      name="code"
                      className="form-input uppercase"
                      maxLength={3}
                    />
                    <ErrorMessage name="code" component="div" className="text-red-500 text-xs mt-1" />
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
                      setEditingShippingLine(null);
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
      
      {/* Shipping Lines List */}
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
                  Nom
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
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
              {shippingLines.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    Aucun armateur trouvé
                  </td>
                </tr>
              ) : (
                shippingLines.map((shippingLine) => (
                  <tr key={shippingLine.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{shippingLine.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{shippingLine.code}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        shippingLine.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {shippingLine.active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {showDeleteConfirm === shippingLine.id ? (
                        <div className="flex items-center justify-end space-x-2">
                          <span className="text-sm text-gray-600 mr-2">Confirmer?</span>
                          <button
                            onClick={() => handleDeleteShippingLine(shippingLine.id)}
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
                            onClick={() => handleEditShippingLine(shippingLine)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(shippingLine.id)}
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

export default ShippingLineManagement;
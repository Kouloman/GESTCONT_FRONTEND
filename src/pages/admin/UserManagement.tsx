import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { UserPlus, Edit, Trash2, Check, X } from 'lucide-react';
import api from '../../services/api';
import { mockUserService } from '../../services/mockServices';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

// Validation schema for user form
const UserSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères')
    .required('Le nom d\'utilisateur est requis'),
  email: Yup.string()
    .email('Email invalide')
    .required('L\'email est requis'),
  password: Yup.string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .required('Le mot de passe est requis'),
  role: Yup.string()
    .oneOf(['admin', 'user'], 'Rôle invalide')
    .required('Le rôle est requis'),
  permissions: Yup.array()
    .of(Yup.string()),
});

// Available permissions
const availablePermissions = [
  'read:containers',
  'create:containers',
  'update:containers',
  'delete:containers',
  'read:shipping-lines',
  'create:shipping-lines',
  'update:shipping-lines',
  'delete:shipping-lines',
  'read:iso-codes',
  'create:iso-codes',
  'update:iso-codes',
  'delete:iso-codes',
];

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    
    try {
      // Try API first
      try {
        const response = await api.get('/users');
        setUsers(response.data);
      } catch (error) {
        // Fall back to mock service in development
        if (import.meta.env.DEV) {
          const mockUsers = await mockUserService.getAll();
          setUsers(mockUsers);
        } else {
          throw error;
        }
      }
    } catch (error) {
      toast.error("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleDeleteUser = async (userId) => {
    try {
      // Try API first
      try {
        await api.delete(`/users/${userId}`);
      } catch (error) {
        // Fall back to mock service in development
        if (import.meta.env.DEV && error.isMockable) {
          await mockUserService.delete(userId);
        } else {
          throw error;
        }
      }
      
      toast.success("Utilisateur supprimé avec succès");
      setUsers(users.filter(user => user.id !== userId));
    } catch (error) {
      toast.error("Erreur lors de la suppression de l'utilisateur");
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  const handleSubmit = async (values, { resetForm }) => {
    setIsSubmitting(true);
    
    try {
      if (editingUser) {
        // Update existing user
        try {
          const response = await api.put(`/users/${editingUser.id}`, values);
          setUsers(users.map(user => user.id === editingUser.id ? response.data : user));
        } catch (error) {
          // Fall back to mock service in development
          if (import.meta.env.DEV && error.isMockable) {
            const updatedUser = await mockUserService.update(editingUser.id, values);
            setUsers(users.map(user => user.id === editingUser.id ? updatedUser : user));
          } else {
            throw error;
          }
        }
        
        toast.success("Utilisateur mis à jour avec succès");
      } else {
        // Create new user
        try {
          const response = await api.post('/users', values);
          setUsers([...users, response.data]);
        } catch (error) {
          // Fall back to mock service in development
          if (import.meta.env.DEV && error.isMockable) {
            const newUser = await mockUserService.create(values);
            setUsers([...users, newUser]);
          } else {
            throw error;
          }
        }
        
        toast.success("Utilisateur créé avec succès");
      }
      
      setIsFormOpen(false);
      setEditingUser(null);
      resetForm();
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement de l'utilisateur");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des utilisateurs</h1>
          <p className="text-gray-600">Créez et gérez les utilisateurs du système</p>
        </div>
        
        <button
          onClick={handleCreateUser}
          className="btn btn-primary flex items-center"
        >
          <UserPlus size={18} className="mr-2" />
          Nouvel utilisateur
        </button>
      </div>
      
      {/* User Form */}
      {isFormOpen && (
        <div className="bg-white rounded-lg shadow-sm p-6 animate-fadeIn">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            {editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
          </h2>
          
          <Formik
            initialValues={{
              username: editingUser?.username || '',
              email: editingUser?.email || '',
              password: '',
              role: editingUser?.role || 'user',
              permissions: editingUser?.permissions || [],
            }}
            validationSchema={UserSchema}
            onSubmit={handleSubmit}
          >
            {({ values, setFieldValue, isSubmitting: formikSubmitting }) => (
              <Form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Username */}
                  <div>
                    <label htmlFor="username" className="form-label">Nom d'utilisateur</label>
                    <Field
                      type="text"
                      id="username"
                      name="username"
                      className="form-input"
                    />
                    <ErrorMessage name="username" component="div" className="text-red-500 text-xs mt-1" />
                  </div>
                  
                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="form-label">Email</label>
                    <Field
                      type="email"
                      id="email"
                      name="email"
                      className="form-input"
                    />
                    <ErrorMessage name="email" component="div" className="text-red-500 text-xs mt-1" />
                  </div>
                  
                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="form-label">
                      {editingUser ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe'}
                    </label>
                    <Field
                      type="password"
                      id="password"
                      name="password"
                      className="form-input"
                      required={!editingUser}
                    />
                    <ErrorMessage name="password" component="div" className="text-red-500 text-xs mt-1" />
                  </div>
                  
                  {/* Role */}
                  <div>
                    <label htmlFor="role" className="form-label">Rôle</label>
                    <Field
                      as="select"
                      id="role"
                      name="role"
                      className="form-select"
                    >
                      <option value="user">Utilisateur</option>
                      <option value="admin">Administrateur</option>
                    </Field>
                    <ErrorMessage name="role" component="div" className="text-red-500 text-xs mt-1" />
                  </div>
                </div>
                
                {/* Permissions */}
                {values.role === 'user' && (
                  <div className="mt-4">
                    <label className="form-label">Autorisations</label>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {availablePermissions.map(permission => (
                        <div key={permission} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`permission-${permission}`}
                            checked={values.permissions.includes(permission)}
                            onChange={() => {
                              const newPermissions = values.permissions.includes(permission)
                                ? values.permissions.filter(p => p !== permission)
                                : [...values.permissions, permission];
                              setFieldValue('permissions', newPermissions);
                            }}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor={`permission-${permission}`} className="ml-2 text-sm text-gray-700">
                            {permission}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false);
                      setEditingUser(null);
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
      
      {/* Users List */}
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
                  Nom d'utilisateur
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Autorisations
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.username}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role === 'admin' ? 'Admin' : 'Utilisateur'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.role === 'admin' ? (
                        <span className="text-sm text-gray-500">Toutes les autorisations</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {user.permissions && user.permissions.length > 0 ? (
                            user.permissions.slice(0, 3).map((permission, index) => (
                              <span key={index} className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                                {permission}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">Aucune</span>
                          )}
                          {user.permissions && user.permissions.length > 3 && (
                            <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                              +{user.permissions.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {showDeleteConfirm === user.id ? (
                        <div className="flex items-center justify-end space-x-2">
                          <span className="text-sm text-gray-600 mr-2">Confirmer?</span>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
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
                            onClick={() => handleEditUser(user)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(user.id)}
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

export default UserManagement;
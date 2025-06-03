import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { User, Mail, Lock } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

// Validation schema
const ProfileSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères')
    .required('Le nom d\'utilisateur est requis'),
  email: Yup.string()
    .email('Email invalide')
    .required('L\'email est requis'),
  currentPassword: Yup.string()
    .when('newPassword', {
      is: val => val && val.length > 0,
      then: Yup.string().required('Le mot de passe actuel est requis pour changer votre mot de passe'),
    }),
  newPassword: Yup.string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .matches(
      /^(?=.*[a-z])(?=.*[0-9])/,
      'Le mot de passe doit contenir au moins une lettre et un chiffre'
    ),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Les mots de passe doivent correspondre'),
});

const Profile = () => {
  const { user, checkAuth } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    
    try {
      // Only include password if new password is provided
      const profileData = {
        username: values.username,
        email: values.email,
      };
      
      if (values.newPassword) {
        profileData.password = values.newPassword;
      }
      
      // Send update request
      await api.put('/auth/profile', profileData);
      
      toast.success('Profil mis à jour avec succès');
      await checkAuth(); // Refresh user data
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Profil</h1>
        <p className="text-gray-600">Gérez vos informations personnelles</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6 max-w-2xl animate-fadeIn">
        <Formik
          initialValues={{
            username: user.username || '',
            email: user.email || '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          }}
          validationSchema={ProfileSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting: formikSubmitting }) => (
            <Form className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Informations de base</h2>
                
                <div>
                  <label htmlFor="username" className="form-label">Nom d'utilisateur</label>
                  <div className="relative">
                    <Field
                      type="text"
                      id="username"
                      name="username"
                      className="form-input pl-10"
                    />
                    <User size={16} className="absolute left-3 top-3 text-gray-400" />
                  </div>
                  <ErrorMessage name="username" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                
                <div>
                  <label htmlFor="email" className="form-label">Email</label>
                  <div className="relative">
                    <Field
                      type="email"
                      id="email"
                      name="email"
                      className="form-input pl-10"
                    />
                    <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                  </div>
                  <ErrorMessage name="email" component="div" className="text-red-500 text-xs mt-1" />
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Changer le mot de passe</h2>
                
                <div>
                  <label htmlFor="currentPassword" className="form-label">Mot de passe actuel</label>
                  <div className="relative">
                    <Field
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      className="form-input pl-10"
                    />
                    <Lock size={16} className="absolute left-3 top-3 text-gray-400" />
                  </div>
                  <ErrorMessage name="currentPassword" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                
                <div>
                  <label htmlFor="newPassword" className="form-label">Nouveau mot de passe</label>
                  <div className="relative">
                    <Field
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      className="form-input pl-10"
                    />
                    <Lock size={16} className="absolute left-3 top-3 text-gray-400" />
                  </div>
                  <ErrorMessage name="newPassword" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="form-label">Confirmer le nouveau mot de passe</label>
                  <div className="relative">
                    <Field
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      className="form-input pl-10"
                    />
                    <Lock size={16} className="absolute left-3 top-3 text-gray-400" />
                  </div>
                  <ErrorMessage name="confirmPassword" component="div" className="text-red-500 text-xs mt-1" />
                </div>
              </div>
              
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || formikSubmitting}
                  className="btn btn-primary min-w-[150px] flex items-center justify-center"
                >
                  {isSubmitting ? <LoadingSpinner size="small" /> : 'Enregistrer'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6 max-w-2xl animate-fadeIn">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Informations du compte</h2>
        
        <div className="space-y-3">
          <div className="flex">
            <span className="text-sm font-medium text-gray-500 w-40">Rôle:</span>
            <span className="text-sm">
              {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
            </span>
          </div>
          
          <div className="flex">
            <span className="text-sm font-medium text-gray-500 w-40">Autorisations:</span>
            <div>
              {user.role === 'admin' ? (
                <span className="text-sm">Toutes les autorisations</span>
              ) : (
                <div className="text-sm">
                  {user.permissions && user.permissions.length > 0 ? (
                    user.permissions.map((permission, index) => (
                      <span key={index} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-2 mb-2">
                        {permission}
                      </span>
                    ))
                  ) : (
                    <span>Aucune autorisation spécifique</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
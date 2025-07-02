import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Box, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

// Validation schema
const LoginSchema = Yup.object().shape({
  username: Yup.string()
    .required('Le nom d\'utilisateur est requis'),
  password: Yup.string()
    .required('Le mot de passe est requis'),
});

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    setLoginError('');
    try {
      await login(values.username, values.password);
      navigate('/');
    } catch (error) {
      setLoginError('Identifiants invalides');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md w-full max-w-md p-8 animate-fadeIn">
        <div className="flex justify-center mb-6">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100">
            <Box className="h-8 w-8 text-blue-900" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">GESTCONT</h1>
        <p className="text-center text-gray-600 mb-8">Système de gestion de conteneurs</p>
        
        <Formik
          initialValues={{ username: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting: formikSubmitting }) => (
            <Form className="space-y-4">
              {loginError && (
                <div className="text-red-500 text-center text-sm">{loginError}</div>
              )}
              <div>
                <label htmlFor="username" className="form-label">Nom d'utilisateur</label>
                <Field
                  type="text"
                  id="username"
                  name="username"
                  className="form-input"
                  placeholder="Entrez votre nom d'utilisateur"
                />
                <ErrorMessage name="username" component="div" className="text-red-500 text-xs mt-1" />
              </div>
              
              <div>
                <label htmlFor="password" className="form-label">Mot de passe</label>
                <Field
                  type="password"
                  id="password"
                  name="password"
                  className="form-input"
                  placeholder="Entrez votre mot de passe"
                />
                <ErrorMessage name="password" component="div" className="text-red-500 text-xs mt-1" />
              </div>
              
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || formikSubmitting}
                  className="btn btn-primary w-full flex items-center justify-center"
                >
                  {isSubmitting ? <LoadingSpinner size="small" /> : (
                    <>
                      <LogIn size={18} className="mr-2" />
                      Se connecter
                    </>
                  )}
                </button>
              </div>
              
              <div className="text-center text-sm text-gray-500 mt-4">
                <p>Voir le README pour vous connecter</p>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Login;
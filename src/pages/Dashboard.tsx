import React from 'react';

import { useEffect, useState } from 'react';
import { Box, Ship, TruckIcon, RotateCw } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import ContainerChart from '../components/dashboard/ContainerChart';
import ShippingLineChart from '../components/dashboard/ShippingLineChart';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import api from '../services/api';
import { mockContainerService } from '../services/mockServices';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Try API first
        try {
          const response = await api.get('/dashboard/stats');
          setStats(response.data);
        } catch (error) {
          // Fall back to mock service in development
          if (import.meta.env.DEV) {
            const mockStats = await mockContainerService.getDashboardStats();
            setStats(mockStats);
          } else {
            throw error;
          }
        }
      } catch (error) {
        toast.error("Erreur lors du chargement des statistiques");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Tableau de bord</h1>
        <button 
          className="btn btn-outline flex items-center"
          onClick={() => window.location.reload()}
        >
          <RotateCw size={16} className="mr-2" />
          Actualiser
        </button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total des conteneurs" 
          value={stats.totalContainers} 
          icon={<Box size={24} />} 
          color="blue"
        />
        <StatCard 
          title="Conteneurs dans le parc" 
          value={stats.containersInPark} 
          icon={<Box size={24} />} 
          color="green"
        />
        <StatCard 
          title="Conteneurs sortis" 
          value={stats.containersOut} 
          icon={<Ship size={24} />} 
          color="yellow"
        />
        <StatCard 
          title="Conteneurs réservés" 
          value={stats.containersBooked} 
          icon={<TruckIcon size={24} />} 
          color="red"
        />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ContainerChart data={stats.movementsByDay} />
        <ShippingLineChart data={stats.shippingLineStats} />
      </div>
      
      {/* Container Type Distribution */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Distribution par type de conteneur</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-500">Conteneurs DRY</p>
              <p className="text-2xl font-bold text-blue-900">{stats.dryContainers}</p>
              <p className="text-sm text-gray-500">
                {((stats.dryContainers / stats.totalContainers) * 100).toFixed(1)}% du total
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-900">
              <Box size={24} />
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-teal-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-500">Conteneurs REEFER</p>
              <p className="text-2xl font-bold text-teal-900">{stats.reeferContainers}</p>
              <p className="text-sm text-gray-500">
                {((stats.reeferContainers / stats.totalContainers) * 100).toFixed(1)}% du total
              </p>
            </div>
            <div className="p-3 rounded-full bg-teal-100 text-teal-900">
              <Box size={24} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
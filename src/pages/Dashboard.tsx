import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Network, Thermometer, Battery, Shield, AlertTriangle, Check } from 'lucide-react';
import { useNetwork } from '../context/NetworkContext';
import SensorStatus from '../components/dashboard/SensorStatus';
import NetworkOverview from '../components/dashboard/NetworkOverview';
import EnergyStatus from '../components/dashboard/EnergyStatus';
import SecurityStatus from '../components/dashboard/SecurityStatus';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { network, sensors } = useNetwork();

  const totalNodes = network.nodes.length;
  const activeNodes = network.nodes.filter(node => node.active).length;
  const clusterHeads = network.nodes.filter(node => node.isClusterHead).length;
  
  const alerts = [
    { id: 1, type: 'warning', message: 'Node 5 battery level critical (12%)', time: '5 mins ago' },
    { id: 2, type: 'info', message: 'Cluster head rotation completed', time: '15 mins ago' },
    { id: 3, type: 'success', message: 'System update completed successfully', time: '1 hour ago' },
    { id: 4, type: 'warning', message: 'Temperature spike detected in Living Room', time: '2 hours ago' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">WSN Dashboard</h1>
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">
            System Online
          </span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div onClick={() => navigate('/network')} className="p-4 bg-white rounded-lg shadow cursor-pointer hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Network Nodes</p>
              <p className="text-2xl font-semibold text-gray-800">{activeNodes}/{totalNodes}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Network className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-600">{clusterHeads} active cluster heads</p>
        </div>

        <div onClick={() => navigate('/sensors')} className="p-4 bg-white rounded-lg shadow cursor-pointer hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Sensors</p>
              <p className="text-2xl font-semibold text-gray-800">{sensors.filter(s => s.active).length}/{sensors.length}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Thermometer className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-600">Last reading: 5 mins ago</p>
        </div>

        <div onClick={() => navigate('/energy')} className="p-4 bg-white rounded-lg shadow cursor-pointer hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Avg. Battery Level</p>
              <p className="text-2xl font-semibold text-gray-800">
                {Math.round(network.nodes.reduce((acc, node) => acc + node.battery, 0) / network.nodes.length)}%
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Battery className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-600">3 nodes need attention</p>
        </div>

        <div onClick={() => navigate('/security')} className="p-4 bg-white rounded-lg shadow cursor-pointer hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Security Status</p>
              <p className="text-2xl font-semibold text-gray-800">Secure</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-full">
              <Shield className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-600">Last check: 10 mins ago</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="overflow-hidden bg-white rounded-lg shadow">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900">Network Overview</h3>
          </div>
          <div className="h-64 p-4">
            <NetworkOverview />
          </div>
        </div>

        <div className="overflow-hidden bg-white rounded-lg shadow">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900">Sensor Status</h3>
          </div>
          <div className="p-4">
            <SensorStatus />
          </div>
        </div>

        <div className="overflow-hidden bg-white rounded-lg shadow">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900">Energy Consumption</h3>
          </div>
          <div className="h-64 p-4">
            <EnergyStatus />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900">System Alerts</h3>
          </div>
          <div className="px-4 py-3 divide-y divide-gray-200">
            {alerts.map(alert => (
              <div key={alert.id} className="py-3">
                <div className="flex items-start">
                  {alert.type === 'warning' && (
                    <AlertTriangle className="flex-shrink-0 w-5 h-5 mr-3 text-yellow-500" />
                  )}
                  {alert.type === 'success' && (
                    <Check className="flex-shrink-0 w-5 h-5 mr-3 text-green-500" />
                  )}
                  {alert.type === 'info' && (
                    <Network className="flex-shrink-0 w-5 h-5 mr-3 text-blue-500" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                    <p className="text-xs text-gray-500">{alert.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium text-gray-900">Security Status</h3>
        </div>
        <div className="p-4">
          <SecurityStatus />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
import React from 'react';
import { useNetwork } from '../../context/NetworkContext';
import { Shield, Lock, WifiOff, Server, AlertTriangle, Check } from 'lucide-react';

const SecurityStatus: React.FC = () => {
  const { network } = useNetwork();
  
  const securityFeatures = [
    {
      name: 'Data Encryption',
      description: 'AES-256 encryption for all sensor data',
      status: 'active',
      details: 'All sensor data is encrypted using AES-256 before transmission',
      icon: <Lock className="w-6 h-6" />
    },
    {
      name: 'MQTT TLS',
      description: 'Transport Layer Security for MQTT',
      status: 'active',
      details: 'TLS v1.3 used for all MQTT communications',
      icon: <Shield className="w-6 h-6" />
    },
    {
      name: 'Authentication',
      description: 'JWT-based authentication',
      status: 'active',
      details: 'JWT with RSA-256 for authenticating dashboard access',
      icon: <Server className="w-6 h-6" />
    },
    {
      name: 'Access Control',
      description: 'Role-based access control',
      status: 'active',
      details: 'RBAC implemented for different user levels',
      icon: <Shield className="w-6 h-6" />
    },
    {
      name: 'Intrusion Detection',
      description: 'ML-based anomaly detection',
      status: 'inactive',
      details: 'Not yet configured - requires more training data',
      icon: <AlertTriangle className="w-6 h-6" />
    },
    {
      name: 'Network Jamming Protection',
      description: 'Detection and mitigation of signal jamming',
      status: 'inactive',
      details: 'Hardware support not available on all nodes',
      icon: <WifiOff className="w-6 h-6" />
    }
  ];
  
  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg border border-green-200 bg-green-50">
        <div className="flex">
          <div className="flex-shrink-0">
            <Shield className="h-5 w-5 text-green-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">Security Status: Protected</h3>
            <div className="mt-2 text-sm text-green-700">
              <p>Your network is using industry-standard security measures. Core features like encryption and authentication are active.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {securityFeatures.map((feature, index) => (
          <div key={index} className={`p-4 rounded-lg border ${
            feature.status === 'active' 
              ? 'border-green-200 bg-green-50' 
              : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="flex items-center">
              <div className={`p-2 rounded-full ${
                feature.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'
              }`}>
                {feature.icon}
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">{feature.name}</h3>
                <p className="text-sm text-gray-500">{feature.description}</p>
              </div>
              <div className="ml-auto">
                {feature.status === 'active' ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Check className="w-3 h-3 mr-1" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Inactive
                  </span>
                )}
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">{feature.details}</p>
          </div>
        ))}
      </div>
      
      <div className="overflow-hidden bg-white rounded-lg shadow">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Security Recommendations</h3>
          <p className="mt-1 text-sm text-gray-500">Actions to improve network security</p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-4">
            <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Enable Intrusion Detection</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>Configure the anomaly detection system to identify potential security threats.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Update Node 7 Firmware</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>Node 7 is running outdated firmware that may contain security vulnerabilities.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Shield className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Renew TLS Certificate</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>Your TLS certificate for MQTT will expire in 30 days. Plan to renew it.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityStatus;
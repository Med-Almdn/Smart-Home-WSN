import React from 'react';
import { useNetwork } from '../../context/NetworkContext';
import { Shield, Lock, Wifi, Server, CheckCircle, XCircle } from 'lucide-react';

const SecurityStatus: React.FC = () => {
  const { network } = useNetwork();
  
  const securityFeatures = [
    {
      name: 'Node Encryption',
      icon: <Lock className="w-5 h-5" />,
      status: 'active',
      details: 'AES-256 encryption for all node communication'
    },
    {
      name: 'MQTT TLS',
      icon: <Wifi className="w-5 h-5" />,
      status: 'active',
      details: 'TLS 1.3 for MQTT broker connections'
    },
    {
      name: 'JWT Auth',
      icon: <Shield className="w-5 h-5" />,
      status: 'active',
      details: 'JWT with RSA-256 for API authentication'
    },
    {
      name: 'Intrusion Detection',
      icon: <Server className="w-5 h-5" />,
      status: 'inactive',
      details: 'Anomaly detection system not configured'
    }
  ];
  
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {securityFeatures.map((feature, index) => (
        <div key={index} className="flex p-3 border rounded-lg">
          <div className={`p-2 mr-3 rounded-md ${
            feature.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
          }`}>
            {feature.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">{feature.name}</h3>
              {feature.status === 'active' ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <p className="text-xs text-gray-500">{feature.details}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SecurityStatus;
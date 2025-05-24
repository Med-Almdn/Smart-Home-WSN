import React, { useState } from 'react';
import { useNetwork } from '../context/NetworkContext';
import { Shield, AlertTriangle, Lock, Unlock, Check, RefreshCw, Eye, EyeOff } from 'lucide-react';
import SecurityStatus from '../components/security/SecurityStatus';
import EncryptionDemo from '../components/security/EncryptionDemo';
import AuthenticationDemo from '../components/security/AuthenticationDemo';
import TrafficAnalyzer from '../components/security/TrafficAnalyzer';

const Security: React.FC = () => {
  const { network, runSecurityCheck } = useNetwork();
  const [activeTab, setActiveTab] = useState('status');
  
  const securityStats = {
    overallScore: 87,
    encryptionStrength: 'Strong (AES-256)',
    authMethod: 'JWT with RSA',
    lastCheck: '10 minutes ago',
    vulnerabilities: [
      { id: 1, severity: 'medium', description: 'Node 7 outdated firmware', status: 'open' },
      { id: 2, severity: 'low', description: 'TLS certificate expires in 30 days', status: 'open' },
    ]
  };

  const handleSecurityCheck = () => {
    runSecurityCheck();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between md:flex-row md:items-center">
        <h1 className="text-2xl font-bold text-gray-800">Network Security</h1>
        <div className="flex flex-wrap items-center mt-4 space-x-2 md:mt-0">
          <button 
            className="flex items-center px-3 py-2 space-x-2 text-sm bg-white rounded-md shadow hover:bg-gray-50"
            onClick={handleSecurityCheck}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Run Security Check</span>
          </button>
        </div>
      </div>

      {/* Security Score */}
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="flex flex-col items-center md:flex-row">
          <div className="flex items-center justify-center w-40 h-40">
            <div className="relative">
              <svg viewBox="0 0 36 36" className="w-32 h-32">
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#eee"
                  strokeWidth="3"
                  strokeDasharray="100, 100"
                />
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={securityStats.overallScore > 80 ? "#10B981" : securityStats.overallScore > 60 ? "#F59E0B" : "#EF4444"}
                  strokeWidth="3"
                  strokeDasharray={`${securityStats.overallScore}, 100`}
                />
                <text x="18" y="20.5" className="text-5xl font-medium" textAnchor="middle" fill="#333">
                  {securityStats.overallScore}
                </text>
              </svg>
            </div>
          </div>
          <div className="flex-1 md:ml-6">
            <h2 className="mb-4 text-xl font-semibold">Security Assessment</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-gray-500">Encryption</p>
                <div className="flex items-center mt-1">
                  <Lock className="w-5 h-5 mr-2 text-green-500" />
                  <p className="text-gray-800">{securityStats.encryptionStrength}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Authentication</p>
                <div className="flex items-center mt-1">
                  <Shield className="w-5 h-5 mr-2 text-green-500" />
                  <p className="text-gray-800">{securityStats.authMethod}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Last Check</p>
                <div className="flex items-center mt-1">
                  <Check className="w-5 h-5 mr-2 text-blue-500" />
                  <p className="text-gray-800">{securityStats.lastCheck}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Open Vulnerabilities</p>
                <div className="flex items-center mt-1">
                  <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" />
                  <p className="text-gray-800">{securityStats.vulnerabilities.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Tabs */}
      <div className="flex flex-wrap mb-4 space-x-2 overflow-x-auto">
        <button
          className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
            activeTab === 'status'
              ? 'bg-blue-100 text-blue-600 rounded-md'
              : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('status')}
        >
          Security Status
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
            activeTab === 'encryption'
              ? 'bg-blue-100 text-blue-600 rounded-md'
              : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('encryption')}
        >
          Encryption Demo
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
            activeTab === 'auth'
              ? 'bg-blue-100 text-blue-600 rounded-md'
              : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('auth')}
        >
          Authentication
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
            activeTab === 'traffic'
              ? 'bg-blue-100 text-blue-600 rounded-md'
              : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('traffic')}
        >
          Traffic Analysis
        </button>
      </div>

      {/* Content based on active tab */}
      <div className="p-4 bg-white rounded-lg shadow">
        {activeTab === 'status' && <SecurityStatus />}
        {activeTab === 'encryption' && <EncryptionDemo />}
        {activeTab === 'auth' && <AuthenticationDemo />}
        {activeTab === 'traffic' && <TrafficAnalyzer />}
      </div>

      {/* Vulnerabilities List */}
      {activeTab === 'status' && (
        <div className="overflow-hidden bg-white rounded-lg shadow">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900">Detected Vulnerabilities</h3>
            <p className="mt-1 text-sm text-gray-500">Security issues that need attention</p>
          </div>
          <div className="overflow-x-auto">
            {securityStats.vulnerabilities.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Severity
                    </th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {securityStats.vulnerabilities.map((vuln) => (
                    <tr key={vuln.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                          vuln.severity === 'high' 
                            ? 'bg-red-100 text-red-800' 
                            : vuln.severity === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {vuln.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{vuln.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                          vuln.status === 'open' 
                            ? 'bg-red-100 text-red-800' 
                            : vuln.status === 'in progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {vuln.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap">
                        <button className="text-indigo-600 hover:text-indigo-900">Fix</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center p-8">
                <Shield className="w-12 h-12 mb-4 text-green-500" />
                <p className="text-lg font-medium text-gray-900">No vulnerabilities detected</p>
                <p className="text-sm text-gray-500">Your network is secure.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Security;
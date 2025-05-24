import React, { useState } from 'react';
import { User, Lock, Key, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const AuthenticationDemo: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [authState, setAuthState] = useState<'initial' | 'success' | 'failure'>('initial');
  const [jwt, setJwt] = useState('');
  const [jwtDecoded, setJwtDecoded] = useState<{header: any, payload: any} | null>(null);
  
  const handleLogin = () => {
    // Simulate login process
    if (username === 'admin' && password === 'password') {
      setAuthState('success');
      
      // Create a fake JWT
      const header = {
        alg: 'RS256',
        typ: 'JWT'
      };
      
      const payload = {
        sub: '1234567890',
        name: 'Admin User',
        role: 'admin',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600
      };
      
      const headerBase64 = btoa(JSON.stringify(header));
      const payloadBase64 = btoa(JSON.stringify(payload));
      const signature = 'FAKE_SIGNATURE_FOR_DEMO_PURPOSES_ONLY';
      
      const token = `${headerBase64}.${payloadBase64}.${signature}`;
      setJwt(token);
      setJwtDecoded({header, payload});
    } else {
      setAuthState('failure');
      setJwt('');
      setJwtDecoded(null);
    }
  };
  
  const handleReset = () => {
    setUsername('');
    setPassword('');
    setAuthState('initial');
    setJwt('');
    setJwtDecoded(null);
  };
  
  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg border border-blue-200 bg-blue-50">
        <h3 className="text-sm font-medium text-blue-800">JWT Authentication Demo</h3>
        <p className="mt-1 text-sm text-blue-600">
          This demo shows how JWT authentication works in the Smart Home WSN system. Try logging in with username "admin" and password "password".
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="mb-4 text-lg font-medium text-gray-900">Authentication</h3>
          
          {authState === 'initial' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="username"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              
              <button
                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                onClick={handleLogin}
              >
                Log In
              </button>
              
              <div>
                <button
                  type="button"
                  className="text-sm text-gray-600 hover:text-gray-900"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  {showAdvanced ? 'Hide' : 'Show'} Advanced Security Options
                </button>
                
                {showAdvanced && (
                  <div className="mt-2 space-y-2 p-3 bg-gray-50 rounded-md">
                    <div>
                      <label className="flex items-center">
                        <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                        <span className="ml-2 text-sm text-gray-700">Enable 2FA</span>
                      </label>
                    </div>
                    
                    <div>
                      <label className="flex items-center">
                        <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" defaultChecked />
                        <span className="ml-2 text-sm text-gray-700">Use TLS</span>
                      </label>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-700">Token Expiration</label>
                      <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                        <option>1 hour</option>
                        <option>8 hours</option>
                        <option>24 hours</option>
                        <option>7 days</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {authState === 'success' && (
            <div className="space-y-4">
              <div className="p-4 rounded-md bg-green-50 border border-green-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Authentication Successful</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>You have been authenticated and a JWT token has been generated.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <button
                className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                onClick={handleReset}
              >
                Log Out
              </button>
            </div>
          )}
          
          {authState === 'failure' && (
            <div className="space-y-4">
              <div className="p-4 rounded-md bg-red-50 border border-red-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <XCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Authentication Failed</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>Invalid username or password. Please try again.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <button
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                onClick={handleReset}
              >
                Try Again
              </button>
            </div>
          )}
        </div>
        
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="mb-4 text-lg font-medium text-gray-900">
            {jwt ? 'JWT Token' : 'Token Information'}
          </h3>
          
          {jwt ? (
            <div className="space-y-4">
              <div className="p-2 bg-gray-50 rounded-md">
                <div className="text-xs font-medium text-gray-500 uppercase">Encoded Token</div>
                <div className="mt-1 font-mono text-xs break-all">
                  <span className="text-red-500">{jwt.split('.')[0]}</span>.
                  <span className="text-blue-500">{jwt.split('.')[1]}</span>.
                  <span className="text-green-500">{jwt.split('.')[2]}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="p-2 bg-red-50 rounded-md">
                  <div className="text-xs font-medium text-red-700 uppercase">Header</div>
                  <pre className="mt-1 text-xs overflow-auto max-h-32">
                    {JSON.stringify(jwtDecoded?.header, null, 2)}
                  </pre>
                </div>
                
                <div className="p-2 bg-blue-50 rounded-md">
                  <div className="text-xs font-medium text-blue-700 uppercase">Payload</div>
                  <pre className="mt-1 text-xs overflow-auto max-h-32">
                    {JSON.stringify(jwtDecoded?.payload, null, 2)}
                  </pre>
                </div>
              </div>
              
              <div className="p-2 bg-green-50 rounded-md">
                <div className="text-xs font-medium text-green-700 uppercase">Signature</div>
                <div className="mt-1 font-mono text-xs">
                  HMACSHA256(
                  <br />
                  <span className="ml-4">base64UrlEncode(header) + "." +</span>
                  <br />
                  <span className="ml-4">base64UrlEncode(payload),</span>
                  <br />
                  <span className="ml-4 text-gray-500">your-256-bit-secret</span>
                  <br />
                  );
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-yellow-50 rounded-md border-l-4 border-yellow-400">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      JWT tokens will be displayed here after successful authentication.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900">How JWT Authentication Works:</h4>
                
                <div className="flex">
                  <div className="flex-shrink-0 mt-1">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600">
                      1
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-700">
                      User provides credentials (username/password)
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0 mt-1">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600">
                      2
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-700">
                      Server verifies credentials and generates a JWT token
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0 mt-1">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600">
                      3
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-700">
                      JWT contains encoded user information and permissions
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0 mt-1">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600">
                      4
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-700">
                      Token is sent with each subsequent request for authentication
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0 mt-1">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600">
                      5
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-700">
                      Server validates the token signature without needing to store session data
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="mb-4 text-lg font-medium text-gray-900">Role-Based Access Control</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  View Data
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Configure Sensors
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Manage Users
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Security Settings
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">Admin</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">Manager</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <XCircle className="h-5 w-5 text-red-500" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <XCircle className="h-5 w-5 text-red-500" />
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">User</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <XCircle className="h-5 w-5 text-red-500" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <XCircle className="h-5 w-5 text-red-500" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <XCircle className="h-5 w-5 text-red-500" />
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">Guest</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">Limited</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <XCircle className="h-5 w-5 text-red-500" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <XCircle className="h-5 w-5 text-red-500" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <XCircle className="h-5 w-5 text-red-500" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuthenticationDemo;
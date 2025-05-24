import React, { useState, useEffect } from 'react';
import { useNetwork } from '../../context/NetworkContext';
import { Lock, Unlock, ArrowRight } from 'lucide-react';

const EncryptionDemo: React.FC = () => {
  const { sensorData, encryptText, decryptText } = useNetwork();
  const [message, setMessage] = useState('');
  const [encrypted, setEncrypted] = useState('');
  const [decrypted, setDecrypted] = useState('');
  const [key, setKey] = useState('0123456789abcdef0123456789abcdef');
  const [demoMode, setDemoMode] = useState<'manual' | 'auto'>('manual');
  const [sensorMessages, setSensorMessages] = useState<any[]>([]);
  const [displayedSensorIndex, setDisplayedSensorIndex] = useState(0);
  
  // Initialize with a default message
  useEffect(() => {
    setMessage(JSON.stringify({ 
      temperature: 23.5, 
      nodeId: 5, 
      timestamp: new Date().toISOString(), 
      battery: 87 
    }, null, 2));
  }, []);
  
  // Generate sensor messages for auto demo
  useEffect(() => {
    if (demoMode === 'auto') {
      const messages = [];
      for (let i = 0; i < 5; i++) {
        const sensorType = ['temperature', 'humidity', 'motion', 'gas', 'door'][i % 5];
        const nodeId = i + 1;
        const value = sensorType === 'temperature' ? (20 + Math.random() * 10).toFixed(1) :
                     sensorType === 'humidity' ? (30 + Math.random() * 50).toFixed(1) :
                     sensorType === 'motion' ? Math.random() > 0.5 :
                     sensorType === 'gas' ? (100 + Math.random() * 300).toFixed(1) :
                     Math.random() > 0.5;
        
        const msg = {
          type: sensorType,
          value: value,
          nodeId: nodeId,
          timestamp: new Date().toISOString(),
          battery: Math.round(60 + Math.random() * 30)
        };
        
        messages.push({
          plain: JSON.stringify(msg, null, 2),
          encrypted: '',
          decrypted: ''
        });
      }
      
      setSensorMessages(messages);
      
      // Encrypt the first message
      const encryptedText = encryptText(messages[0].plain, key);
      const updatedMessages = [...messages];
      updatedMessages[0].encrypted = encryptedText;
      setSensorMessages(updatedMessages);
      
      // Set up interval to cycle through messages
      const interval = setInterval(() => {
        setDisplayedSensorIndex(prev => (prev + 1) % messages.length);
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [demoMode, encryptText, key]);
  
  // Handle auto demo message updates
  useEffect(() => {
    if (demoMode === 'auto' && sensorMessages.length > 0) {
      const currentMsg = sensorMessages[displayedSensorIndex];
      
      // Encrypt message if not already encrypted
      if (!currentMsg.encrypted) {
        const encryptedText = encryptText(currentMsg.plain, key);
        const updatedMessages = [...sensorMessages];
        updatedMessages[displayedSensorIndex].encrypted = encryptedText;
        setSensorMessages(updatedMessages);
      }
      
      // Decrypt after a short delay to simulate transmission
      setTimeout(() => {
        if (currentMsg.encrypted && !currentMsg.decrypted) {
          const decryptedText = decryptText(currentMsg.encrypted, key);
          const updatedMessages = [...sensorMessages];
          updatedMessages[displayedSensorIndex].decrypted = decryptedText;
          setSensorMessages(updatedMessages);
        }
      }, 1500);
    }
  }, [displayedSensorIndex, sensorMessages, encryptText, decryptText, demoMode, key]);
  
  const handleEncrypt = () => {
    const encryptedText = encryptText(message, key);
    setEncrypted(encryptedText);
    setDecrypted('');
  };
  
  const handleDecrypt = () => {
    if (encrypted) {
      const decryptedText = decryptText(encrypted, key);
      setDecrypted(decryptedText);
    }
  };
  
  const renderColorizedJson = (jsonString: string) => {
    try {
      const obj = JSON.parse(jsonString);
      const highlightedJson = JSON.stringify(obj, null, 2)
        .replace(/"([^"]+)":/g, '<span class="text-blue-600">"$1"</span>:')
        .replace(/:(\s*)"([^"]+)"/g, ':<span class="text-green-600">$1"$2"</span>')
        .replace(/:(\s*)(\d+)/g, ':<span class="text-amber-600">$1$2</span>')
        .replace(/:(\s*)(true|false)/g, ':<span class="text-purple-600">$1$2</span>');
      
      return <pre dangerouslySetInnerHTML={{ __html: highlightedJson }} />;
    } catch (e) {
      return <pre>{jsonString}</pre>;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex space-x-4">
        <button
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            demoMode === 'manual' 
              ? 'bg-blue-100 text-blue-600'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setDemoMode('manual')}
        >
          Manual Demo
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            demoMode === 'auto' 
              ? 'bg-blue-100 text-blue-600'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setDemoMode('auto')}
        >
          Automatic Demo
        </button>
      </div>
      
      {demoMode === 'manual' ? (
        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-blue-200 bg-blue-50">
            <h3 className="text-sm font-medium text-blue-800">AES-256 Encryption Demo</h3>
            <p className="mt-1 text-sm text-blue-600">
              This demo shows how sensor data is encrypted before transmission and decrypted upon reception.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="p-4 bg-white rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Plaintext</h3>
                <Unlock className="h-5 w-5 text-gray-400" />
              </div>
              <textarea
                className="w-full h-40 p-2 border border-gray-300 rounded-md font-mono text-sm"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter a message to encrypt..."
              />
              <button
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 w-full"
                onClick={handleEncrypt}
              >
                Encrypt
              </button>
            </div>
            
            <div className="p-4 bg-white rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Encrypted</h3>
                <Lock className="h-5 w-5 text-blue-600" />
              </div>
              <div className="w-full h-40 p-2 border border-gray-300 rounded-md font-mono text-sm bg-gray-50 overflow-auto">
                {encrypted || <span className="text-gray-400">Encrypted text will appear here...</span>}
              </div>
              <button
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 w-full"
                onClick={handleDecrypt}
                disabled={!encrypted}
              >
                Decrypt
              </button>
            </div>
            
            <div className="p-4 bg-white rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Decrypted</h3>
                <Unlock className="h-5 w-5 text-green-600" />
              </div>
              <div className="w-full h-40 p-2 border border-gray-300 rounded-md font-mono text-sm bg-gray-50 overflow-auto">
                {decrypted ? renderColorizedJson(decrypted) : <span className="text-gray-400">Decrypted text will appear here...</span>}
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="mb-2 text-sm font-medium text-gray-700">Encryption Key (AES-256)</h3>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md font-mono text-sm"
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
            <p className="mt-2 text-xs text-gray-500">
              This key is used for both encryption and decryption. In a real system, this key would be securely stored and never transmitted.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-blue-200 bg-blue-50">
            <h3 className="text-sm font-medium text-blue-800">Automated Sensor Data Encryption</h3>
            <p className="mt-1 text-sm text-blue-600">
              This simulation shows how sensor data is automatically encrypted before transmission and decrypted at the gateway.
            </p>
          </div>
          
          {sensorMessages.length > 0 && (
            <div className="relative">
              <div className="flex items-center justify-center md:justify-start space-x-4 md:space-x-8 mb-4">
                {sensorMessages.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index === displayedSensorIndex 
                        ? 'bg-blue-600' 
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              
              <div className="relative md:flex md:space-x-4 space-y-4 md:space-y-0">
                <div className="p-4 bg-white rounded-lg shadow md:w-1/3">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Sensor Data</h3>
                    <div className={`px-2 py-1 text-xs rounded-full ${
                      sensorMessages[displayedSensorIndex].plain ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      Node {JSON.parse(sensorMessages[displayedSensorIndex].plain).nodeId}
                    </div>
                  </div>
                  <div className="w-full h-48 p-2 border border-gray-300 rounded-md font-mono text-xs bg-gray-50 overflow-auto">
                    {renderColorizedJson(sensorMessages[displayedSensorIndex].plain)}
                  </div>
                </div>
                
                <div className="hidden md:block md:w-8 self-center">
                  <ArrowRight className="w-8 h-8 text-gray-400" />
                </div>
                
                <div className="p-4 bg-white rounded-lg shadow md:w-1/3">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Encrypted</h3>
                    <Lock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="w-full h-48 p-2 border border-gray-300 rounded-md font-mono text-xs bg-gray-50 overflow-auto">
                    {sensorMessages[displayedSensorIndex].encrypted || (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-gray-400">Encrypting...</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="hidden md:block md:w-8 self-center">
                  <ArrowRight className="w-8 h-8 text-gray-400" />
                </div>
                
                <div className="p-4 bg-white rounded-lg shadow md:w-1/3">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Gateway Received</h3>
                    <Unlock className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="w-full h-48 p-2 border border-gray-300 rounded-md font-mono text-xs bg-gray-50 overflow-auto">
                    {sensorMessages[displayedSensorIndex].decrypted ? (
                      renderColorizedJson(sensorMessages[displayedSensorIndex].decrypted)
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-gray-400">Waiting for data...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="mb-4 text-lg font-medium text-gray-900">How It Works</h3>
            <div className="space-y-3">
              <div className="flex">
                <div className="flex-shrink-0 mt-1">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600">
                    1
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-700">
                    <strong>Data Collection:</strong> Sensors collect data (temperature, humidity, motion, etc.) and format it as JSON.
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
                    <strong>Encryption:</strong> Each sensor node uses its pre-shared AES-256 key to encrypt the JSON data before transmission.
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
                    <strong>Transmission:</strong> Encrypted data is transmitted over the network to the gateway/base station.
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
                    <strong>Decryption:</strong> The gateway uses the same key to decrypt the data back to its original JSON format.
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
                    <strong>Processing:</strong> The gateway can now process the data and send it to the database or dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EncryptionDemo;
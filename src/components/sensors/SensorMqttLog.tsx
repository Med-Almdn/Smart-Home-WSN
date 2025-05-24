import React, { useState, useEffect, useRef } from 'react';
import { useNetwork } from '../../context/NetworkContext';

interface SensorMqttLogProps {
  sensorType: string;
}

const SensorMqttLog: React.FC<SensorMqttLogProps> = ({ sensorType }) => {
  const { sensors, generateMqttMessages } = useNetwork();
  const [messages, setMessages] = useState<any[]>([]);
  const logRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Initialize with some messages
    const initialMessages = generateMqttMessages(sensorType, 10);
    setMessages(initialMessages);
    
    // Add new messages periodically
    const interval = setInterval(() => {
      const newMessage = generateMqttMessages(sensorType, 1)[0];
      setMessages(prev => [...prev, newMessage].slice(-100)); // Keep last 100 messages
    }, 3000);
    
    return () => clearInterval(interval);
  }, [sensorType, generateMqttMessages]);
  
  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messages]);
  
  const unitMap: Record<string, string> = {
    temperature: '°C',
    humidity: '%',
    gas: 'ppm',
    motion: '',
    light: 'lux',
    door: ''
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">MQTT Message Log</h3>
        <div className="flex items-center text-xs text-gray-500">
          <span className="inline-block w-2 h-2 mr-1 bg-green-500 rounded-full"></span>
          Connected to mqtt://broker.example.com:1883
        </div>
      </div>
      <div 
        ref={logRef}
        className="flex-1 p-3 overflow-y-auto font-mono text-xs bg-gray-900 rounded-md text-gray-200"
        style={{ maxHeight: '280px' }}
      >
        {messages.map((msg, index) => (
          <div key={index} className="mb-1">
            <span className="text-gray-500">[{msg.timestamp}]</span>{' '}
            <span className="text-blue-400">MQTT</span>{' '}
            <span className="text-green-400">{msg.topic}</span>:{' '}
            <span className="text-amber-300">{msg.payload}</span>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <h3 className="mb-2 text-sm font-medium">Topic Structure</h3>
        <div className="p-3 bg-gray-50 rounded-md">
          <code className="text-xs text-gray-800">
            home/sensors/<strong>{sensorType}</strong>/&lt;sensor_id&gt;
          </code>
          <p className="mt-2 text-xs text-gray-600">
            Message format: JSON with timestamp, value{unitMap[sensorType] ? ` (${unitMap[sensorType]})` : ''}, 
            battery status, and node ID.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SensorMqttLog;
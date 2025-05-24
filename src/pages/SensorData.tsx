import React, { useState } from 'react';
import { useNetwork } from '../context/NetworkContext';
import { Filter, Download, RefreshCw } from 'lucide-react';
import SensorChart from '../components/sensors/SensorChart';
import SensorDataTable from '../components/sensors/SensorDataTable';
import SensorMqttLog from '../components/sensors/SensorMqttLog';

const SensorData: React.FC = () => {
  const { sensors, refreshSensorData } = useNetwork();
  const [activeTab, setActiveTab] = useState('temperature');
  const [viewMode, setViewMode] = useState('chart');
  const [timeRange, setTimeRange] = useState('1h');
  const [filterOptions, setFilterOptions] = useState({
    showOffline: true,
    location: 'all'
  });

  const locations = [...new Set(sensors.map(sensor => sensor.location))];

  const sensorTypes = [
    { id: 'temperature', name: 'Temperature', unit: '°C' },
    { id: 'humidity', name: 'Humidity', unit: '%' },
    { id: 'gas', name: 'Gas (MQ-2)', unit: 'ppm' },
    { id: 'motion', name: 'Motion (PIR)', unit: 'events' },
    { id: 'light', name: 'Light (LDR)', unit: 'lux' },
    { id: 'door', name: 'Door Status', unit: 'open/closed' }
  ];

  const handleDownloadData = () => {
    // Logic to download sensor data as CSV
    alert('Data download functionality would be implemented here');
  };

  const filteredSensors = sensors.filter(sensor => {
    if (!filterOptions.showOffline && !sensor.active) return false;
    if (filterOptions.location !== 'all' && sensor.location !== filterOptions.location) return false;
    return sensor.type === activeTab;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between md:flex-row md:items-center">
        <h1 className="text-2xl font-bold text-gray-800">Sensor Data</h1>
        <div className="flex flex-wrap items-center mt-4 space-x-2 md:mt-0">
          <button 
            className="flex items-center px-3 py-2 space-x-2 text-sm bg-white rounded-md shadow hover:bg-gray-50"
            onClick={refreshSensorData}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button 
            className="flex items-center px-3 py-2 space-x-2 text-sm bg-white rounded-md shadow hover:bg-gray-50"
            onClick={handleDownloadData}
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <div className="relative">
            <button 
              className="flex items-center px-3 py-2 space-x-2 text-sm bg-white rounded-md shadow hover:bg-gray-50"
            >
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
            <div className="absolute right-0 z-10 hidden w-56 mt-2 bg-white rounded-md shadow-lg top-full">
              {/* Dropdown content would go here */}
            </div>
          </div>
        </div>
      </div>

      {/* Sensor Type Tabs */}
      <div className="flex flex-wrap space-x-1 overflow-x-auto border-b border-gray-200">
        {sensorTypes.map(type => (
          <button
            key={type.id}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
              activeTab === type.id
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab(type.id)}
          >
            {type.name}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        <div className="flex-1 p-4 bg-white rounded-lg shadow">
          <h3 className="mb-3 text-sm font-medium text-gray-700">Filters</h3>
          <div className="flex flex-wrap items-center space-x-4">
            <div className="flex items-center">
              <input
                id="showOffline"
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                checked={filterOptions.showOffline}
                onChange={() => setFilterOptions(prev => ({ ...prev, showOffline: !prev.showOffline }))}
              />
              <label htmlFor="showOffline" className="ml-2 text-sm text-gray-700">
                Show Offline Sensors
              </label>
            </div>
            <div>
              <select
                className="block w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={filterOptions.location}
                onChange={(e) => setFilterOptions(prev => ({ ...prev, location: e.target.value }))}
              >
                <option value="all">All Locations</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="mb-3 text-sm font-medium text-gray-700">Time Range</h3>
          <div className="flex space-x-2">
            {['1h', '6h', '24h', '7d', '30d'].map(range => (
              <button
                key={range}
                className={`px-3 py-1 text-sm font-medium rounded-md ${
                  timeRange === range
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setTimeRange(range)}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="mb-3 text-sm font-medium text-gray-700">View Mode</h3>
          <div className="flex space-x-2">
            <button
              className={`px-3 py-1 text-sm font-medium rounded-md ${
                viewMode === 'chart'
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setViewMode('chart')}
            >
              Chart
            </button>
            <button
              className={`px-3 py-1 text-sm font-medium rounded-md ${
                viewMode === 'table'
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setViewMode('table')}
            >
              Table
            </button>
            <button
              className={`px-3 py-1 text-sm font-medium rounded-md ${
                viewMode === 'mqtt'
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setViewMode('mqtt')}
            >
              MQTT Log
            </button>
          </div>
        </div>
      </div>

      {/* Sensor Data View */}
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="mb-4 text-lg font-medium">
          {sensorTypes.find(s => s.id === activeTab)?.name} Data
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({sensorTypes.find(s => s.id === activeTab)?.unit})
          </span>
        </h3>

        {viewMode === 'chart' && (
          <div className="h-80">
            <SensorChart 
              sensorType={activeTab} 
              sensors={filteredSensors}
              timeRange={timeRange}
            />
          </div>
        )}

        {viewMode === 'table' && (
          <SensorDataTable 
            sensors={filteredSensors}
            sensorType={activeTab}
          />
        )}

        {viewMode === 'mqtt' && (
          <SensorMqttLog 
            sensorType={activeTab}
          />
        )}
      </div>
    </div>
  );
};

export default SensorData;